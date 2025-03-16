export interface Bible {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  language: {
    id: string;
    name: string;
    nameLocal: string;
    script: string;
    scriptDirection: string;
  };
}

export interface BibleVerse {
  id: string;
  reference: string;
  text: string;
  copyright: string;
}

export interface VerseWithBackground extends BibleVerse {
  backgroundGradient: string;
}