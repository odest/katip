// Whisper Model Configuration for Transformers.js
// Models are automatically downloaded from Hugging Face CDN and cached in browser

export interface WhisperModel {
  id: string;
  name: string;
  size: string;
  quantizedSize: string;
  description: string;
  category: "multilingual" | "englishOnly" | "distilled";
}

export const WHISPER_MODELS: WhisperModel[] = [
  // Multilingual Models
  {
    id: "Xenova/whisper-tiny",
    name: "Whisper Tiny",
    size: "152 MB",
    quantizedSize: "41 MB",
    description: "tinyDescription",
    category: "multilingual",
  },
  {
    id: "Xenova/whisper-base",
    name: "Whisper Base",
    size: "292 MB",
    quantizedSize: "77 MB",
    description: "baseDescription",
    category: "multilingual",
  },
  {
    id: "Xenova/whisper-small",
    name: "Whisper Small",
    size: "968 MB",
    quantizedSize: "249 MB",
    description: "smallDescription",
    category: "multilingual",
  },
  {
    id: "Xenova/whisper-medium",
    name: "Whisper Medium",
    size: "3.06 GB",
    quantizedSize: "776 MB",
    description: "mediumDescription",
    category: "multilingual",
  },
  {
    id: "Xenova/whisper-large",
    name: "Whisper Large",
    size: "6.18 GB",
    quantizedSize: "1.52 GB",
    description: "largeDescription",
    category: "multilingual",
  },
  {
    id: "Xenova/whisper-large-v2",
    name: "Whisper Large v2",
    size: "6.18 GB",
    quantizedSize: "1.52 GB",
    description: "largeV2Description",
    category: "multilingual",
  },
  {
    id: "Xenova/whisper-large-v3",
    name: "Whisper Large v3",
    size: "6.18 GB",
    quantizedSize: "1.52 GB",
    description: "largeV3Description",
    category: "multilingual",
  },

  // englishOnly Models
  {
    id: "Xenova/whisper-tiny.en",
    name: "Whisper Tiny (EN)",
    size: "152 MB",
    quantizedSize: "41 MB",
    description: "tinyENDescription",
    category: "englishOnly",
  },
  {
    id: "Xenova/whisper-base.en",
    name: "Whisper Base (EN)",
    size: "292 MB",
    quantizedSize: "77 MB",
    description: "baseENDescription",
    category: "englishOnly",
  },
  {
    id: "Xenova/whisper-small.en",
    name: "Whisper Small (EN)",
    size: "968 MB",
    quantizedSize: "249 MB",
    description: "smallENDescription",
    category: "englishOnly",
  },
  {
    id: "Xenova/whisper-medium.en",
    name: "Whisper Medium (EN)",
    size: "3.06 GB",
    quantizedSize: "776 MB",
    description: "mediumENDescription",
    category: "englishOnly",
  },

  // Distilled Models (Faster & Accurate)
  {
    id: "distil-whisper/distil-small.en",
    name: "Distil Small (EN)",
    size: "665 MB",
    quantizedSize: "172 MB",
    description: "distilSmallENDescription",
    category: "distilled",
  },
  {
    id: "distil-whisper/distil-medium.en",
    name: "Distil Medium (EN)",
    size: "1.57 GB",
    quantizedSize: "402 MB",
    description: "distilMediumENDescription",
    category: "distilled",
  },
  {
    id: "distil-whisper/distil-large-v2",
    name: "Distil Large v2",
    size: "3.01 GB",
    quantizedSize: "767 MB",
    description: "distilLargeV2Description",
    category: "distilled",
  },
  {
    id: "distil-whisper/distil-large-v3",
    name: "Distil Large v3",
    size: "3.01 GB",
    quantizedSize: "767 MB",
    description: "distilLargeV3Description",
    category: "distilled",
  },
];

// Helper to get models by category
export const getModelsByCategory = (
  category: WhisperModel["category"]
): WhisperModel[] => {
  return WHISPER_MODELS.filter((model) => model.category === category);
};

// Helper to find model by ID
export const getModelById = (id: string): WhisperModel | undefined => {
  return WHISPER_MODELS.find((model) => model.id === id);
};

// Category labels for UI
export const CATEGORY_LABELS = {
  multilingual: "multilingual",
  englishOnly: "englishOnly",
  distilled: "distilled",
} as const;
