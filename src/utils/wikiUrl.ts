export const getWikiUrl = (name: string): string => {
  // Handle edge cases if necessary, but general rule:
  // 1. Split by dash or space
  // 2. Capitalize each part
  // 3. Join with underscores
  // 4. Append _(Pokémon)
  
  const formattedName = name
    .split(/[- ]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('_');
    
  return `https://bulbapedia.bulbagarden.net/wiki/${formattedName}_(Pokémon)`;
};
