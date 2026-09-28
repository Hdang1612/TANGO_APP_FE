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
