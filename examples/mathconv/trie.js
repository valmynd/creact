export class Trie {
  constructor() {
    this.trie = {}
    this.n_keys = 0
    this.n_values = 0
  }

  insert(value, ...keys) {
    ++this.n_values
    for (let key of keys) {
      ++this.n_keys
      let char, previous, current = this.trie
      for (let i = 0, len = key.length; i < len; i++) {
        char = key[i]
        previous = current
        current = previous[char]
        if (current === undefined) {
          previous[char] = {}
          current = previous[char]
        }
      }
      current["_val"] = value
    }
  }
}
