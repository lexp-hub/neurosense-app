import { corsHeaders, jsonResponse, resolveModel } from '../../_shared.js';

const TURN_SCHEMA = {
  type: 'object',
  required: ['question', 'isGuess', 'guess', 'reaction'],
  properties: {
    question: { type: 'string' },
    isGuess: { type: 'boolean' },
    guess: { type: 'string' },
    reaction: { type: 'string' },
  },
};

const getMessageText = (content) => {
  if (typeof content === 'string') {
    return content;
  }

  if (!Array.isArray(content)) {
    return '';
  }

  return content
    .map((part) => {
      if (typeof part === 'string') {
        return part;
      }

      if (part?.type === 'text' && typeof part?.text === 'string') {
        return part.text;
      }

      return '';
    })
    .join('')
    .trim();
};

export const onRequestOptions = async () =>
  new Response(null, {
    headers: corsHeaders,
  });

export const onRequestPost = async ({ request, env }) => {
  try {
    if (!env.AI) {
      console.error('AI Binding missing');
      return jsonResponse(
        {
          error: 'Workers AI binding mancante. Assicurati che il binding chiamato "AI" sia configurato nelle impostazioni delle Pages Functions su Cloudflare.',
          context: 'check_cloudflare_dashboard_bindings'
        },
        500,
      );
    }

    const body = await request.json();
    const selectedModel = resolveModel(env, body?.model);
    
    console.log(`Invocazione modello: ${selectedModel}`);

    const response = await env.AI.run(selectedModel, {
      messages: body?.messages || [],
      temperature: body?.temperature ?? 0.7,
      max_tokens: body?.max_tokens ?? 400,
      stream: false,
    });

    if (!response) {
      throw new Error('Il modello AI non ha restituito alcuna risposta.');
    }

    console.log(`AI Response for ${selectedModel}:`, JSON.stringify(response));

    const content =
      response?.response ||
      response?.answer ||
      getMessageText(response?.result?.response) ||
      getMessageText(response?.result) ||
      (typeof response === 'string' ? response : '');

    let finalContent = content;
    try {
      const parsed = JSON.parse(content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1));
      if (parsed.isGuess && parsed.guess) {
        const wikiRes = await fetch(`https://it.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(parsed.guess.trim())}`, {
          headers: { 'User-Agent': 'NeurosenseApp/1.0' }
        });
        if (wikiRes.ok) {
          const wikiData = await wikiRes.json();
          finalContent = JSON.stringify({
            ...parsed,
            description: wikiData.extract || "",
            imageUrl: wikiData.originalimage?.source || ""
          });
        }
      }
    } catch (e) {
      console.error("Errore parsing o Wiki:", e);
    }

    return jsonResponse({
      id: crypto.randomUUID(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: selectedModel,
      choices: [
        {
          index: 0,
          finish_reason: 'stop',
          message: {
            role: 'assistant',
            content: finalContent,
          },
        },
      ],
      usage: response?.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Richiesta Workers AI non riuscita.',
      },
      500,
    );
  }
};
