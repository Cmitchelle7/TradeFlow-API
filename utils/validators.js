/**
 * Validates whether a string is a valid Stellar public key.
 * A valid Stellar public key starts with 'G', is exactly 56 characters long,
 * and contains only valid base32 characters (A-Z, 2-7).
 *
 * @param {string} address - The address to validate
 * @returns {boolean} true if valid, false otherwise
 */
function isValidStellarAddress(address) {
  if (typeof address !== 'string') return false;
  return /^G[A-Z2-7]{55}$/.test(address);
}

module.exports = { isValidStellarAddress };
