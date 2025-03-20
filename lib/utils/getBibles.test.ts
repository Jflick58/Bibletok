import { filterEnglishBibles } from './getBibles';

describe('filterEnglishBibles', () => {
  it('returns only English Bibles', () => {
    const mockBibles = [
      { id: '1', language: { name: 'English' } },
      { id: '2', language: { name: 'Spanish' } },
      { id: '3', language: { name: 'English' } },
      { id: '4', language: { name: 'French' } },
    ];

    const result = filterEnglishBibles(mockBibles);
    
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('3');
  });

  it('handles empty array', () => {
    const result = filterEnglishBibles([]);
    expect(result).toEqual([]);
  });

  it('handles bibles with missing language property', () => {
    const mockBibles = [
      { id: '1', language: { name: 'English' } },
      { id: '2' }, // Missing language
      { id: '3', language: null }, // Null language
      { id: '4', language: { name: 'English' } },
    ];

    const result = filterEnglishBibles(mockBibles);
    
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('4');
  });
});