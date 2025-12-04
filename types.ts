export enum RowStatus {
  NEW = 'NEW',
  DRAFT = 'DRAFT',
  TRANSLATED = 'TRANSLATED',
  APPROVED = 'APPROVED'
}

export interface TranslationRow {
  id: string;
  original: string;
  translation: string;
  status: RowStatus;
  context?: string; 
  notes?: string;
  originalObject?: any;
  isDuplicate?: boolean; // Flag for duplicate rows
  parentId?: string;     // ID of the first occurrence
}

export interface ImportMapping {
  idColumn: string;
  sourceColumn: string;
  targetColumn: string;
}

export interface ProjectStats {
  total: number;
  translated: number;
  progress: number;
}

export interface TranslationConfig {
  targetLanguage: string;
  batchSize: number;
  temperature: number;
  systemPrompt: string;
  delay: number; // ms
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'request' | 'response' | 'error';
  message: string;
  details?: any;
}

export const DEFAULT_CONFIG: TranslationConfig = {
  targetLanguage: 'Russian',
  batchSize: 10,
  temperature: 1.0,
  delay: 1000,
  systemPrompt: `You are a professional game localizer assistant (Translator++).
Translate the text from Source Language to \${TARGET_LANG}.

RULES:
1. Preserve ALL RPG Maker/Unity tags exactly: \\n, \\r, <br>, \\V[n], \\N[n], \\C[n], <color=...>, {0}, %s, |text|.
2. Do NOT translate internal IDs, filenames, or variable names like "actor_01".
3. Maintain the context and tone of a fantasy game unless specified otherwise.
4. Output ONLY the translated strings in the requested JSON format.`
};