interface Env { AI: any; }

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (request.method === "GET") return Response.json({ data: [{ id: "@cf/moonshotai/kimi-k2.6" }] }, { headers: corsHeaders });

  try {
    const body: any = await request.json();
    const aiResponse = await env.AI.run(body.model || "@cf/moonshotai/kimi-k2.6", {
      messages: body.messages,
      temperature: 0.4,
    });

    const rawText = typeof aiResponse === 'string' ? aiResponse : (aiResponse.response || aiResponse.text || "");
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error("L'IA non ha restituito un formato JSON valido");

    const cleanJson = JSON.parse(rawText.substring(start, end + 1));
    let wikiData = { description: "", imageUrl: "" };

    // IL CAMPO DEVE ESSERE 'guess' COME NEL PROMPT
    if (cleanJson.isGuess && cleanJson.guess) {
      try {
        const query = encodeURIComponent(cleanJson.guess.trim());
        const wikiRes = await fetch(`https://it.wikipedia.org/api/rest_v1/page/summary/${query}`, {
          headers: { 'User-Agent': 'NeurosenseApp/1.0' }
        });
        if (wikiRes.ok) {
          const data: any = await wikiRes.json();
          wikiData = {
            description: data.extract || "",
            imageUrl: data.originalimage?.source || ""
          };
        }
      } catch (e) {}
    }

    return Response.json({
      choices: [{
        message: {
          role: "assistant",
          content: JSON.stringify({ ...cleanJson, ...wikiData })
        }
      }]
    }, { headers: corsHeaders });

  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
};
