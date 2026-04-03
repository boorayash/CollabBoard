/**
 * Simple Fractional Indexing Helper for MVP
 * In a real-world scenario, we'd use a library like 'fractional-indexing'.
 * This simple version just calculates midpoints or increments.
 */

export const generateNewRank = (prevRank, nextRank) => {
  if (!prevRank && !nextRank) return 'n';
  if (!prevRank) return String.fromCharCode(nextRank.charCodeAt(0) - 1);
  if (!nextRank) return String.fromCharCode(prevRank.charCodeAt(0) + 1);
  
  // Very simple midpoint: (prev + next) / 2
  // Note: This is a placeholder for a robust implementation.
  const mid = (prevRank.charCodeAt(0) + nextRank.charCodeAt(0)) / 2;
  return String.fromCharCode(Math.floor(mid));
};

export const getInitialRank = (index) => {
  return String.fromCharCode(97 + index); // a, b, c...
};
