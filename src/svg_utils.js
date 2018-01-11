export const nsHTML = "http://www.w3.org/1999/xhtml"
export const nsSVG = "http://www.w3.org/2000/svg"

/**
 * @param {Object} obj
 * @param {string} n (attributeName)
 * @returns {*} (popped value)
 */
function pop(obj, n) {
  let v = obj[n]
  delete obj[n]
  return v
}

/**
 * Some SVG Nodes must not have child nodes...
 * @param {VirtualNode} vn
 * @param {VirtualNode[]} [descendants] (already collected)
 * @returns {VirtualNode[]}
 */
function collectDescendants(vn, descendants = []) {
  for (let i = 0, c = vn.children, len = c.length; i < len; i++) {
    descendants.push(c[i])
    if (c[i].tag !== "svg" && c[i].tag !== "g") { // PROBLEM: not instantiated more often than not!!!!!!!!!!!!!!!!!!
      descendants.concat(collectDescendants(c[i], descendants))
      c.splice(i, 1)
    }
  }
  return descendants
}


/**
 * Returns whether the VirtualNode qualifies as SVG and if so, does some adjustments!
 * @param {VirtualNode} vn
 */
export function checkIfSVG(vn) {
  let a, tag = vn.tag
  switch (tag) {
    case "text":
    case "path":
    case "rect":
      return true
    case "circle":
      // assert a.width == a.height
      a = vn.attributes
      a.r = pop(a, "width") / 2
      a.cx = pop(a, "x") + a.r
      a.cy = pop(a, "y") + a.r
      return true
    case "ellipse":
      // maybe use previous centers and radii?
      return true
    // all the above must not have child nodes, actual containers (g, svg) need to collect them
    case "svg":
    case "g":
      vn.children = collectDescendants(vn)
      a = vn.attributes
      let width = pop(a, "width"), height = pop(a, "height") // evtl needed for scaling later?
      a["transform"] = `translate(${pop(a, "x")},${pop(a, "y")})`
      return true
  }
  return false
}
