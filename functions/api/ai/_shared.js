const DEFAULT_MODEL = '@cf/meta/llama-3.1-70b-instruct';

const parseAllowedModels = (env) => {
  const configured = env.CF_ALLOWED_AI_MODELS?.trim();

  if (!configured) {
    return [env.CF_WORKERS_AI_MODEL || DEFAULT_MODEL];
  }

  return configured
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);
};

export const getDefaultModel = (env) => env.CF_WORKERS_AI_MODEL || DEFAULT_MODEL;

export const resolveModel = (env, requestedModel) => {
  const allowedModels = parseAllowedModels(env);

  if (requestedModel && allowedModels.includes(requestedModel)) {
    return requestedModel;
  }

  return allowedModels[0] || getDefaultModel(env);
};

export const getModelCatalog = (env) =>
  parseAllowedModels(env).map((model) => ({
    id: model,
    object: 'model',
    owned_by: 'cloudflare-workers-ai',
  }));

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const jsonResponse = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
