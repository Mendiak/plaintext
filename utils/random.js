/**
 * Returns a random item from an array.
 * @param {Array} arr
 * @returns {*}
 */
export function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
