// Helper function to extract retailer brand from store name
export const extractRetailerBrand = (storeName: string): string => {
  // Common Dutch retailer patterns
  const knownRetailers = [
    'Albert Heijn',
    'Jumbo',
    'Plus',
    'Aldi',
    'Coop',
    'Spar',
    'Vomar',
    'Picnic',
    'Dirk',
    'Dekamarkt',
    'Lidl',
    'Nettorama',
    'Boni',
    'Hoogvliet',
    'Jan Linders'
  ];

  // Find the retailer brand that matches the beginning of the store name
  for (const retailer of knownRetailers) {
    if (storeName.startsWith(retailer)) {
      return retailer;
    }
  }

  // Fallback: take the first two words as retailer brand
  const words = storeName.split(' ');
  if (words.length >= 2) {
    return `${words[0]} ${words[1]}`;
  }
  
  // Last resort: take the first word
  return words[0] || storeName;
}; 