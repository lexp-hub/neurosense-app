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

    const rawAiJson = JSON.parse(rawText.substring(start, end + 1));

    // Assicurati che i campi essenziali siano presenti e del tipo corretto
    const processedJson = {
      question: typeof rawAiJson.question === 'string' ? rawAiJson.question : '',
      isGuess: typeof rawAiJson.isGuess === 'boolean' ? rawAiJson.isGuess : false,
      guess: typeof rawAiJson.guess === 'string' ? rawAiJson.guess : '',
      reaction: typeof rawAiJson.reaction === 'string' ? rawAiJson.reaction : '',
    };

    let wikiData = { description: "", imageUrl: "" };

    if (processedJson.isGuess && processedJson.guess) {
      try {
        const query = encodeURIComponent(processedJson.guess.trim());
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
      } catch (e) {
        // Logga l'errore per il debug, ma non bloccare la risposta
        console.error("Errore durante il recupero dei dati da Wikipedia:", e);
      }
    }

    return Response.json({
      choices: [{
        message: {
          role: "assistant",
          content: JSON.stringify({ ...processedJson, ...wikiData })
        }
      }]
    }, { headers: corsHeaders });

  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
};
