export const nsHTML = "http://www.w3.org/1999/xhtml"
export const nsSVG = "http://www.w3.org/2000/svg"

/**
 * @typedef {Object} SVGInfo
 * @property {boolean} isSVG // whether the tag (which must be a string!) belongs to common SVG Tags
 * @property {Set.<string>} exclude // names of attributes that should be ignored when rendering to DOM or string
 */

const isNotSVG = {isSVG: false, exclude: new Set()}
const isSVGE = {isSVG: true, exclude: new Set(["x", "y", "width", "height"])}
const isSVG = {isSVG: true, exclude: new Set()}

/**
 * Returns whether the VirtualNode qualifies as SVG and if so,
 * whether and which attribute-names to exclude from final output.
 * @param {VirtualNode} vn
 * @returns {SVGInfo}
 */
export function checkIfSVG(vn) {
  let a, tag = vn.tag
  switch (tag) {
    case "text":
    case "path":
    case "rect":
      return isSVG
    case "circle":
      // assert a.width == a.height
      a = vn.attributes
      a.r = a.width / 2
      a.cx = a.x + a.r
      a.cy = a.y + a.r
      return isSVGE
    case "ellipse":
      // maybe use previous centers and radii?
      return isSVG
    // all the above must not have child nodes, but changing the virtual dom (here or anywhere else) would cause side-effects
    // -> actually, removing x, y, width and height may already cause side effects... (esp. for layout-algorithms)
    // -> maybe just leave them there?
    case "svg":
    case "g":
      a = vn.attributes
      if (a.x && a.y) a["transform"] = `translate(${a.x || 0},${a.y || 0})`
      return isSVGE
  }
  return isNotSVG
}
