/**
 * Returns a random item from an array.
 * @param {Array} arr
 * @returns {*}
 */
export function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * FNV-1a 32-bit string hash.
 * Used to turn a quote/style key into a stable seed.
 * @param {string} str
 * @returns {number}
 */
export function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Deterministic PRNG (mulberry32).
 * Returns a function that yields numbers in [0, 1).
 * @param {number} seed
 * @returns {() => number}
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Picks an array item deterministically from a seed.
 * @param {Array} arr
 * @param {string} seed
 */
export function seededPick(arr, seed) {
  return arr[hashString(seed) % arr.length];
}
