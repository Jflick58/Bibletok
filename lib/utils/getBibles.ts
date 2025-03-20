/**
 * Filters an array of Bible objects to return only English Bibles
 * @param bibles Array of Bible objects
 * @returns Array of filtered Bible objects containing only English Bibles
 */
export function filterEnglishBibles(bibles: any[]): any[] {
  if (!bibles || !Array.isArray(bibles)) {
    return [];
  }
  
  return bibles.filter(bible => 
    bible && 
    bible.language && 
    bible.language.name === 'English'
  );
}