export interface Vocabulary {
  id: string;
  japanese: string; // The word in Japanese (Kanji/Hiragana)
  vietnamese: string; // Vietnamese meaning
  hanViet?: string; // Sino-Vietnamese meaning
}

export interface KanjiExample {
  word: string;
  reading?: string;
  meaning?: string;
}

export interface Kanji {
  id: string;
  character: string;
  meaning: string;
  hanViet?: string;
  onYomi?: string; // Âm on (音読み)
  kunYomi?: string; // Âm kun (訓読み)
  examples?: KanjiExample[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  vocabularies: Vocabulary[];
  kanjis: Kanji[];
  createdAt: string;
}

export interface GrammarExample {
  japanese: string;
  vietnamese?: string;
}

export interface Grammar {
  id: string;
  name: string;
  usage: string;
  structure?: string;
  examples?: GrammarExample[];
  groupId?: string;
  group?: GrammarGroup;
  createdAt: string;
  updatedAt: string;
}

export interface GrammarGroup {
  id: string;
  name: string;
  description?: string;
  grammars: Grammar[];
  createdAt: string;
  updatedAt: string;
}
