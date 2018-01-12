// https://stackoverflow.com/questions/29145520/
const floor = Math.floor

/**
 * ported from LLVM libc++, in libcxx/include/algorithm
 * libc++ is dual licensed under the MIT and the University of Illinois Open Source Licenses, see LICENSE_LIBCXX
 * @param {number[]} arr
 * @param {int} first
 * @param {int} nth
 * @param {int} last
 * @param {function} [cmp]
 */
export function nth_element(arr, first, nth, last, cmp = (a, b) => a < b) {
  const _sort3 = (arr, x, y, z, cmp) => {
    let n_swaps = 0
    if (!cmp(arr[y], arr[x])) {
      if (!cmp(arr[z], arr[y]))
        return n_swaps
      swap(arr, y, z)
      n_swaps = 1
      if (cmp(arr[y], arr[x])) {
        swap(arr, x, y)
        n_swaps = 2
      }
      return n_swaps
    }
    if (cmp(arr[z], arr[y])) {
      swap(arr, x, z)
      n_swaps = 1
      return n_swaps
    }
    swap(arr, x, y)
    n_swaps = 1
    if (cmp(arr[z], arr[y])) {
      swap(arr, y, z)
      n_swaps = 2
    }
    return n_swaps
  }
  restart:
    while (true) {
      if (nth === last) return
      let len = last - first
      switch (len) {
        case 0:
        case 1:
          return
        case 2:
          if (cmp(arr[--last], arr[first])) swap(arr, first, last)
          return
        case 3: {
          _sort3(arr, first, first + 1, last - 1, cmp)
          return
        }
      }
      let m = first + floor(len / 2)
      let lm1 = last
      let n_swaps = _sort3(arr, first, m, --lm1, cmp)
      // *m is median
      // partition [first, m) < *m and *m <= [m, last)
      // (this inhibits tossing elements equivalent to m around unnecessarily)
      let i = first, j = lm1
      // j points beyond range to be tested, *lm1 is known to be <= *m
      // The search going up is known to be guarded but the search coming down isn't.
      // Prime the downward search with a guard.
      if (!cmp(arr[i], arr[m])) {
        // *first == *m, *first doesn't go in first part
        // manually guard downward moving j against i
        while (true) {
          if (i === --j) {
            // *first == *m, *m <= all other elements
            // partition instead into [first, i) == *first and *first < [i, last)
            ++i
            j = last
            if (!cmp(arr[first], arr[--j])) {
              while (true) {
                if (i === j)
                  return;  // [first, last) all equivalent elements
                if (cmp(arr[first], arr[i])) {
                  swap(arr, i, j)
                  ++n_swaps
                  ++i
                  break
                }
                ++i
              }
            }
            // [first, i) == *first and *first < [j, last) and j == last - 1
            if (i === j) {
              return
            }
            while (true) {
              while (!cmp(arr[first], arr[i])) {
                ++i
              }
              while (cmp(arr[first], arr[--j])) {
              }
              if (i >= j) break
              swap(arr, i, j)
              ++n_swaps
              ++i
            }
            // [first, i) == *first and *first < [i, last)
            // The first part is sorted,
            if (nth < i) return
            // nth_element the secod part
            first = i
            continue restart
          }
          if (cmp(arr[j], arr[m])) {
            swap(arr, i, j)
            ++n_swaps
            break;  // found guard for downward moving j, now use unguarded partition
          }
        }
      }
      ++i
      // j points beyond range to be tested, *lm1 is known to be <= *m
      // if not yet partitioned...
      if (i < j) {
        // known that *(i - 1) < *m
        while (true) {
          // m still guards upward moving i
          while (cmp(arr[i], arr[m])) {
            ++i
          }
          // It is now known that a guard exists for downward moving j
          while (!cmp(arr[--j], arr[m])) {
          }
          if (i >= j) break
          swap(arr, i, j)
          ++n_swaps
          // It is known that m != j
          // If m just moved, follow it
          if (m === i)
            m = j
          ++i
        }
      }
      // [first, i) < *m and *m <= [i, last)
      if (i !== m && cmp(arr[m], arr[i])) {
        swap(arr, i, m)
        ++n_swaps
      }
      // [first, i) < *i and *i <= [i+1, last)
      if (nth === i) return
      if (n_swaps === 0) {
        // We were given a perfectly partitioned sequence.  Coincidence?
        if (nth < i) {
          // Check for [first, i) already sorted
          j = m = first
          let need_to_sort = false
          while (++j !== i) {
            if (cmp(arr[j], arr[m])) {
              need_to_sort = true
              break
            }
            m = j
          }
          if (!need_to_sort) return
        } else {
          // Check for [i, last) already sorted
          j = m = i
          let need_to_sort = false
          while (++j !== last) {
            if (cmp(arr[j], arr[m])) {
              need_to_sort = true
              break
            }
            m = j
          }
          if (!need_to_sort) return
        }
      }
      // nth_element on range containing nth
      if (nth < i) {
        // nth_element(first, nth, i, cmp)
        last = i
      }
      else {
        // nth_element(i+1, nth, last, cmp)
        first = ++i
      }
    }
}

