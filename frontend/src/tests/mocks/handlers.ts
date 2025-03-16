import { http, HttpResponse } from 'msw';

// Sample mock data
const mockBibles = [
  {
    id: 'niv',
    name: 'New International Version',
    abbreviation: 'NIV',
    description: 'The NIV Bible',
    language: {
      id: 'eng',
      name: 'English',
      nameLocal: 'English',
      script: 'Latin',
      scriptDirection: 'LTR'
    }
  },
  {
    id: 'kjv',
    name: 'King James Version',
    abbreviation: 'KJV',
    description: 'The KJV Bible',
    language: {
      id: 'eng',
      name: 'English',
      nameLocal: 'English',
      script: 'Latin',
      scriptDirection: 'LTR'
    }
  }
];

const mockVerses = [
  {
    id: 'JHN.3.16',
    reference: 'John 3:16',
    text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    copyright: '© NIV'
  },
  {
    id: 'PSA.23.1',
    reference: 'Psalm 23:1',
    text: 'The LORD is my shepherd, I shall not want.',
    copyright: '© NIV'
  },
  {
    id: 'ROM.8.28',
    reference: 'Romans 8:28',
    text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    copyright: '© NIV'
  }
];

export const handlers = [
  // GET /api/bibles
  http.get('/api/bibles', () => {
    return HttpResponse.json({ bibles: mockBibles });
  }),

  // GET /api/bibles/:id
  http.get('/api/bibles/:bibleId', ({ params }) => {
    const { bibleId } = params;
    const bible = mockBibles.find(b => b.id === bibleId);
    
    if (!bible) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json({ bible });
  }),

  // GET /api/verses/:bibleId
  http.get('/api/verses/:bibleId', () => {
    return HttpResponse.json({ verses: mockVerses });
  }),

  // GET /api/verses/:bibleId/after/:verseId
  http.get('/api/verses/:bibleId/after/:verseId', ({ params }) => {
    const { verseId } = params;
    const index = mockVerses.findIndex(v => v.id === verseId);
    
    if (index === -1 || index === mockVerses.length - 1) {
      return HttpResponse.json({ verses: [] });
    }
    
    return HttpResponse.json({ verses: mockVerses.slice(index + 1) });
  }),

  // GET /api/verses/:bibleId/before/:verseId
  http.get('/api/verses/:bibleId/before/:verseId', ({ params }) => {
    const { verseId } = params;
    const index = mockVerses.findIndex(v => v.id === verseId);
    
    if (index === -1 || index === 0) {
      return HttpResponse.json({ verses: [] });
    }
    
    return HttpResponse.json({ verses: mockVerses.slice(0, index) });
  })
];