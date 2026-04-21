import { corsHeaders, getModelCatalog, jsonResponse } from '../_shared.js';

export const onRequestOptions = async () =>
  new Response(null, {
    headers: corsHeaders,
  });

export const onRequestGet = async ({ env }) =>
  jsonResponse({
    object: 'list',
    data: getModelCatalog(env),
  });
