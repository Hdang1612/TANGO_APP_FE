export interface Vocabulary {
  id: string;
  japanese: string; // The word in Japanese (Kanji/Hiragana)
  vietnamese: string; // Vietnamese meaning
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  vocabularies: Vocabulary[];
  createdAt: string;
}
