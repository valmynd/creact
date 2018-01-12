export const nsHTML = "http://www.w3.org/1999/xhtml"
export const nsSVG = "http://www.w3.org/2000/svg"

export const rectDefaults = {fill: "white", stroke: "black"}
export const circleDefaults = {fill: "white", stroke: "black"}

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
      return isSVGE
    case "svg":
    case "g":
      translate(vn)
      return isSVGE
  }
  return isNotSVG
}

/**
 * apply translate (using x and y from the attributes)
 * @param {VirtualNode} vn
 * @param [trnsf]
 * @param [regex]
 */
function translate(vn, trnsf = "translate", regex = /translate[^)]*./) {
  let a = vn.attributes, x = a.x, y = a.y, transform = a.transform
  if (!x && !y) {
    if (!transform) return
    transform = transform.replace(regex, "").trim()
    if (!transform.length) {
      delete a["transform"]
      return
    }
  } else {
    let translate = trnsf + "(" + (x || 0) + "," + (y || 0) + ")"
    if (transform && transform.includes(trnsf)) {
      transform = transform.replace(regex, translate)
    } else {
      transform = (transform && transform.length) ? (transform + " " + translate) : translate
    }
  }
  a["transform"] = transform
}
