export const heapPermuteInfinite = async (words, onEach) => {
  if (!Array.isArray(words) || words.length !== 24) {
    throw new Error("Il faut exactement 24 mots.");
  }
  const set = new Set(words);
  if (set.size !== 24) {
    throw new Error("Les 24 mots doivent être tous différents.");
  }

  const a = words.slice(); // copie du tableau
  const n = a.length; // 24
  const c = new Array(n).fill(0); // compteurs Heap
  let i = 0;
  let count = 0;

  // Première permutation
  if (onEach) {
    const shouldContinue = await onEach(a.slice(), count++);
    if (shouldContinue === false) return; // Arrêter si onEach retourne false
  }

  // Boucle infinie tant que permutations possibles
  while (true) {
    if (i < n) {
      if (c[i] < i) {
        const j = i % 2 === 0 ? 0 : c[i];
        [a[j], a[i]] = [a[i], a[j]]; // swap
        if (onEach) {
          const shouldContinue = await onEach(a.slice(), count++);
          if (shouldContinue === false) return; // Arrêter si onEach retourne false
        }
        c[i]++;
        i = 0;
      } else {
        c[i] = 0;
        i++;
        if (i >= n) {
          console.log("✅ Toutes les permutations ont été générées.");
          break; // Fin quand tout est épuisé
        }
      }
    }
  }
};
