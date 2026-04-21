import { SYSTEM_PROMPT } from '../constants/prompts';

// Client frontend per endpoint OpenAI-compatible basato su OllamaFreeAPI.
// Crediti al progetto originale di mfoud444: https://github.com/mfoud444/ollamafreeapi
const DEFAULT_BASE_URL = '/api/ollama-free';
const DEFAULT_MODEL = 'llama3.2:3b';
const MODEL_OVERRIDE_STORAGE_KEY = 'neurosense.ollamafree.model';

const getBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_OLLAMAFREE_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    return DEFAULT_BASE_URL;
  }

  return configuredBaseUrl.replace(/\/$/, '');
};

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
  defaultModel: import.meta.env.VITE_OLLAMAFREE_MODEL || DEFAULT_MODEL,
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
  const response = await fetch(`${getBaseUrl()}/v1/chat/completions`, {
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
