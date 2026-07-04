export type ChatModel = {
  /** Identifiant AI Gateway, au format "provider/model". */
  id: string;
  name: string;
  /** Slug du créateur du modèle, utilisé pour le logo. */
  provider: string;
};

export const DEFAULT_CHAT_MODELS: ChatModel[] = [
  {
    id: "anthropic/claude-sonnet-5",
    name: "Claude Sonnet 5",
    provider: "anthropic",
  },
  {
    id: "anthropic/claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
  },
  {
    id: "anthropic/claude-opus-4.8",
    name: "Claude Opus 4.8",
    provider: "anthropic",
  },
  { id: "openai/gpt-5.5", name: "GPT-5.5", provider: "openai" },
  { id: "openai/gpt-5.4-mini", name: "GPT-5.4 Mini", provider: "openai" },
  {
    id: "google/gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    provider: "google",
  },
  {
    id: "mistral/mistral-large-3",
    name: "Mistral Large 3",
    provider: "mistral",
  },
];

export const DEFAULT_MODEL_ID = DEFAULT_CHAT_MODELS[0].id;
