import { SYSTEM_PROMPT } from '../constants/prompts';

// Client frontend per endpoint OpenAI-compatible basato su OllamaFreeAPI.
// Crediti al progetto originale di mfoud444: https://github.com/mfoud444/ollamafreeapi
const DEFAULT_BASE_URL = '/api/ollama-free';
const DEFAULT_MODEL = 'llama3.2:3b';
const MODEL_OVERRIDE_STORAGE_KEY = 'neurosense.ollamafree.model';
const BASE_URL_OVERRIDE_STORAGE_KEY = 'neurosense.ollamafree.baseUrl';

const getConfiguredBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_OLLAMAFREE_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    return DEFAULT_BASE_URL;
  }

  return configuredBaseUrl.replace(/\/$/, '');
};

export const getStoredBaseUrlOverride = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(BASE_URL_OVERRIDE_STORAGE_KEY) || '';
};

export const setStoredBaseUrlOverride = (baseUrl) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!baseUrl) {
    window.localStorage.removeItem(BASE_URL_OVERRIDE_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(
    BASE_URL_OVERRIDE_STORAGE_KEY,
    baseUrl.trim().replace(/\/$/, ''),
  );
};

const getBaseUrl = () => getStoredBaseUrlOverride() || getConfiguredBaseUrl();

export const getStoredModelOverride = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(MODEL_OVERRIDE_STORAGE_KEY) || '';
};

export const setStoredModelOverride = (model) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!model) {
    window.localStorage.removeItem(MODEL_OVERRIDE_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(MODEL_OVERRIDE_STORAGE_KEY, model);
};

export const getOllamaFreeConfig = () => ({
  baseUrl: getBaseUrl(),
  configuredBaseUrl: getConfiguredBaseUrl(),
  defaultModel: import.meta.env.VITE_OLLAMAFREE_MODEL || DEFAULT_MODEL,
  isUsingLocalProxy: getBaseUrl().startsWith('/'),
});

const extractMessageContent = (content) => {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }

        if (typeof part?.text === 'string') {
          return part.text;
        }

        return '';
      })
      .join('')
      .trim();
  }

  return '';
};

export const fetchAvailableModels = async () => {
  const response = await fetch(`${getBaseUrl()}/v1/models`);

  if (!response.ok) {
    throw new Error(`Impossibile recuperare i modelli (${response.status}).`);
  }

  const data = await response.json();

  return (data?.data || [])
    .map((model) => model?.id)
    .filter(Boolean);
};

export const requestNextTurn = async (history, modelOverride = '') => {
  const selectedModel = modelOverride || getStoredModelOverride() || getOllamaFreeConfig().defaultModel;
  const baseUrl = getBaseUrl();
  let response;

  try {
    response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        temperature: 0.7,
        stream: false,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history,
          { role: 'user', content: 'Rispondi solo con JSON valido.' },
        ],
      }),
    });
  } catch (error) {
    const isHostedStaticSite =
      typeof window !== 'undefined' &&
      window.location.hostname.includes('github.io') &&
      baseUrl.startsWith('/');

    if (isHostedStaticSite) {
      throw new Error(
        'GitHub Pages non puo usare il proxy locale. Apri le impostazioni e inserisci un endpoint OllamaFreeAPI remoto con CORS abilitato.',
      );
    }

    throw new Error(
      `Connessione a OllamaFreeAPI non riuscita su ${baseUrl}. Verifica che il server sia acceso e raggiungibile.`,
    );
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.error || errorMessage;
    } catch {
      // Ignore invalid JSON error payloads and preserve the HTTP status.
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  const text = extractMessageContent(data?.choices?.[0]?.message?.content);

  if (!text) {
    throw new Error('Risposta del modello vuota o in formato inatteso.');
  }

  return text;
};
