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
  if (!env.AI) {
    return jsonResponse(
      {
        error: 'Workers AI binding mancante. Configura il binding `AI` nel progetto Cloudflare Pages.',
      },
      500,
    );
  }

  try {
    const body = await request.json();
    const selectedModel = resolveModel(env, body?.model);
    const response = await env.AI.run(selectedModel, {
      messages: body?.messages || [],
      temperature: body?.temperature ?? 0.7,
      max_tokens: body?.max_tokens ?? 400,
      stream: false,
      guided_json: TURN_SCHEMA,
    });

    const content =
      response?.response ||
      getMessageText(response?.result?.response) ||
      getMessageText(response?.result) ||
      '';

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
            content,
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
