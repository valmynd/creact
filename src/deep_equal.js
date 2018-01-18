/**
 * Returns whether two Arrays or two Objects have the same contents
 * Only checks Objects that can be stored in JSON, so no Map, Set, Date, etc.!
 * @param {Array|Object} a
 * @param {Array|Object} b
 * @return {boolean}
 */
export function deepEqual(a, b) {
  if (a === b) return true
  let i, aIsArray = Array.isArray(a), bIsArray = Array.isArray(b)
  if (aIsArray !== bIsArray) return false
  if (aIsArray && bIsArray) {
    let len = a.length
    if (len !== b.length) return false
    for (i = 0; i < len; i++) if (!deepEqual(a[i], b[i])) return false
    return true
  }
  if (typeof a === 'object' && typeof b === 'object') {
    let keys = Object.keys(a), len = keys.length
    if (len !== Object.keys(b).length) return false
    for (i = 0; i < len; i++) if (!b.hasOwnProperty(keys[i])) return false
    for (i = 0; i < len; i++) if (!deepEqual(a[keys[i]], b[keys[i]])) return false
    return true
  }
  return false
}
