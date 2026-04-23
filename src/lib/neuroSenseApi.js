import { SYSTEM_PROMPT } from '../constants/prompts';

const DEFAULT_BASE_URL = '/api/ai';
const DEFAULT_MODEL = '@cf/meta/llama-3.1-70b-instruct';

const getBaseUrl = () => localStorage.getItem('neurosense.ai.baseUrl') || DEFAULT_BASE_URL;

export const getStoredBaseUrlOverride = () => localStorage.getItem('neurosense.ai.baseUrl') || '';
export const getStoredModelOverride = () => localStorage.getItem('neurosense.ai.model') || DEFAULT_MODEL;
export const setStoredBaseUrlOverride = (v) => v ? localStorage.setItem('neurosense.ai.baseUrl', v) : localStorage.removeItem('neurosense.ai.baseUrl');
export const setStoredModelOverride = (v) => v ? localStorage.setItem('neurosense.ai.model', v) : localStorage.removeItem('neurosense.ai.model');

export const fetchAvailableModels = async () => {
  try {
    const res = await fetch(`${getBaseUrl()}/v1/models`);
    const data = await res.json();
    return (data?.data || []).map(m => m.id);
  } catch { return [DEFAULT_MODEL]; }
};

export const requestNextTurn = async (history, modelOverride = '') => {
  const model = modelOverride || getStoredModelOverride();
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
  
  if (history && history.length > 0) messages.push(...history);
  else messages.push({ role: 'user', content: 'Inizia. Fammi la prima domanda.' });

  const res = await fetch(`${getBaseUrl()}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature: 0.4 })
  });

  if (!res.ok) throw new Error("Errore Network");

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error("Formato IA non valido");
  
  return text.substring(start, end + 1);
};