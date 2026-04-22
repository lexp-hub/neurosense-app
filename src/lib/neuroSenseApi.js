import { SYSTEM_PROMPT } from '../constants/prompts';

const DEFAULT_BASE_URL = '/api/ai';
const DEFAULT_MODEL = '@cf/moonshot/kimi-k2.6'; // Moonshot Kimi k2.6 su Cloudflare
const MODEL_OVERRIDE_STORAGE_KEY = 'neurosense.ai.model';
const BASE_URL_OVERRIDE_STORAGE_KEY = 'neurosense.ai.baseUrl';
const API_KEY_STORAGE_KEY = 'neurosense.ai.apiKey';

const getConfiguredBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_AI_API_BASE_URL?.trim();

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

export const getStoredApiKey = () => {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(API_KEY_STORAGE_KEY) || '';
};

export const setStoredApiKey = (key) => {
  if (typeof window === 'undefined') return;
  if (!key) {
    window.localStorage.removeItem(API_KEY_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
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
  configuredBaseUrl: getConfiguredBaseUrl(),
  defaultModel: import.meta.env.VITE_AI_MODEL || DEFAULT_MODEL,
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
  const baseUrl = getBaseUrl();
  const apiKey = getStoredApiKey();
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${baseUrl}/v1/models`, { headers });

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
  const apiKey = getStoredApiKey();
  
  let response;

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  try {
    response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: selectedModel,
        temperature: 0.25,
        stream: false,
        messages: [
          { 
            role: 'system', 
            content: `${SYSTEM_PROMPT}\n\nVINCOLI STRETTI:\n1. Fai SOLO domande chiuse (Sì/No/Non lo so).\n2. Se un'ipotesi è stata rifiutata, non riproporla mai più.\n3. Sii logico e usa le risposte precedenti per restringere il campo.` 
          },
          ...history,
          { role: 'user', content: 'Genera il prossimo turno nel formato JSON richiesto. Non aggiungere testo libero prima o dopo il JSON. Assicurati che "question" sia una domanda a cui si possa rispondere solo con Sì o No.' },
        ],
        response_format: selectedModel.includes('gpt') || selectedModel.includes('llama-3') || selectedModel.includes('kimi') || selectedModel.includes('k2.6')
          ? { type: "json_object" } 
          : undefined
      }),
    });
  } catch (error) {
    // Se l'errore è TypeError e siamo nel browser, è quasi certamente un problema di CORS
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(
        'Blocco di sicurezza (CORS): Il browser impedisce la chiamata diretta a Cloudflare. Usa il proxy locale in dev o un Worker in produzione.'
      );
    }

    const isHostedStaticSite =
      typeof window !== 'undefined' &&
      window.location.hostname.includes('github.io') &&
      baseUrl.startsWith('/');

    if (isHostedStaticSite) {
      throw new Error(
        'GitHub Pages non puo usare il proxy locale. Apri le impostazioni e inserisci un endpoint AI remoto con CORS abilitato.',
      );
    }

    throw new Error(
      `Connessione all'endpoint AI non riuscita su ${baseUrl}. Verifica che il servizio sia acceso e raggiungibile.`,
    );
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;

    try {
      const errorData = await response.json();
      // Mostriamo l'errore specifico se presente
      errorMessage = errorData.error || errorData.detail || errorMessage;
      if (errorData.context) errorMessage += ` (${errorData.context})`;
    } catch {
      // Se non è JSON, prendiamo il testo
      const errorText = await response.text().catch(() => '');
      if (errorText) errorMessage = `${errorMessage}: ${errorText.substring(0, 100)}`;
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // Gestione flessibile per diversi formati di risposta (Cloudflare vs OpenAI standard)
  const text = extractMessageContent(
    data?.choices?.[0]?.message?.content || 
    data?.choices?.[0]?.text || 
    data?.result?.response
  );

  if (!text) {
    throw new Error('Risposta del modello vuota o in formato inatteso.');
  }

  return text;
};
