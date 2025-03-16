export interface Bible {
  id: string;
  dblId: string;
  abbreviation: string;
  abbreviationLocal: string;
  language: {
    id: string;
    name: string;
    nameLocal: string;
    script: string;
    scriptDirection: string;
  };
  name: string;
  nameLocal: string;
  description: string;
  descriptionLocal: string;
  info?: string;
  copyright?: string;
}

export interface Verse {
  id: string;
  reference: string;
  text: string;
  copyright: string;
}

export interface BibleAPIResponse<T> {
  data: T;
  meta?: {
    fums: string;
    fumsId: string;
    fumsJsInclude: string;
    fumsJs: string;
    fumsNoScript: string;
  };
}