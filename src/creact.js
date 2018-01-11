import {checkIfSVG, nsHTML, nsSVG} from "./svg_utils"
import {instantiate, link, removeDomNode, removeListener, render, replaceDomNode, setListener} from "./creact_utils"

/**
 * Create a DOM Element that corresponds to a Virtual DOM Node (usually created via JSX)
 * @param {VirtualNode} virtual_node
 * @returns {Element}
 */
export function create(virtual_node) {
  let element, frag, component
  while (typeof virtual_node.tag === 'function')
    virtual_node = render(instantiate(virtual_node))
  element = document.createElementNS(checkIfSVG(virtual_node) ? nsSVG : nsHTML, virtual_node.tag)
  frag = document.createDocumentFragment()
  for (let a in virtual_node.attributes)
    if (a.startsWith("on")) setListener(element, a.substring(2).toLowerCase(), virtual_node.attributes[a])
    else element.setAttribute(a, virtual_node.attributes[a])
  for (let c of virtual_node.children)
    if (typeof c === "string") frag.appendChild(document.createTextNode(c))
    else if (c != null) frag.appendChild(create(c))
  element.appendChild(frag)
  if (component) link(element, component)
  return element
}

/**
 * Change a DOM Element to equal a Virtual DOM Node (usually created via JSX)
 * @param {VirtualNode} virtual_node
 * @param {Node|Element} dom_node
 * @returns {Node|Element} (the mutated dom_node)
 */
export function merge(virtual_node, dom_node) {
  if (virtual_node == null) {
    console.log("NULL", dom_node)
    return
  }
  if (typeof virtual_node === "string") {
    if (dom_node.nodeType === 3) { // Node.TEXT_NODE
      if (dom_node.nodeValue !== virtual_node) dom_node.nodeValue = virtual_node
      return dom_node
    } else {
      return replaceDomNode(dom_node, document.createTextNode(virtual_node))
    }
  }
  // handle situations where dom_node._component.constructor !== virtual_node.tag
  if (typeof virtual_node.tag === "function") {
    let component = dom_node._component
    if (!component || component.constructor !== virtual_node.tag) {
      // NOTE: if for example, component.render() returns <body> and dom_node is <body>, it should NOT
      // be replaced (!) - instead, the existing node simply should get merged and _component-assigned
      component = instantiate(virtual_node)
      virtual_node = render(component)
      link(dom_node, component)
    } else {
      let shall_update = component.setProperties(virtual_node.attributes, virtual_node.children)
      if (!shall_update) return dom_node // no further merging needed
      else virtual_node = render(component)
    }
  }
  // handle situations where dom_node has a different tag-name (which means we cannot reuse it)
  if (virtual_node.tag !== dom_node.nodeName.toLowerCase()) {
    return replaceDomNode(dom_node, create(virtual_node))
  }
  // handle changes on attributes
  // 0) create arrays of existing attribute- and event-names
  let attribute_names = [], event_names = dom_node._listeners ? Object.keys(dom_node._listeners) : []
  if (dom_node.hasAttributes()) for (let i = 0, len = dom_node.attributes.length; i < len; i++)
    attribute_names.push(dom_node.attributes[i].name)
  // 1) added or updated attributes and event listeners
  if (virtual_node.attributes) {
    for (let a in virtual_node.attributes) {
      let value = virtual_node.attributes[a]
      if (a.startsWith("on")) {
        let event_name = a.substring(2).toLowerCase(), i = event_names.indexOf(event_name)
        setListener(dom_node, event_name, value)
        if (i !== -1) event_names.splice(i, 1)
      } else {
        let i = attribute_names.indexOf(a)
        if (i === -1 || dom_node.getAttribute(a) !== value)
          dom_node.setAttribute(a, value)
        if (i !== -1) attribute_names.splice(i, 1)
      }
    }
  }
  // 2) remove orphaned attributes and event listeners
  for (let a in attribute_names) dom_node.removeAttribute(a)
  for (let e in event_names) removeListener(dom_node, e)
  // handle changes on children
  // 0) put nodes with the keyword "key" in a map, and put rest in appropriate arrays/maps
  let nodes_by_key = {}, elements_by_tag = {}, text_nodes = []
  for (let i = 0, n = dom_node.childNodes.length; i < n; i++) {
    let node = dom_node.childNodes[i]
    switch (node.nodeType) {
      case 1: // Node.ELEMENT_NODE
        let key = node.getAttribute("key")
        if (key) {
          nodes_by_key[key] = node
        } else { // exclude keyed children from the other maps to prevent them to be used multiple times
          let tag = node.nodeName.toLowerCase(),
            array = elements_by_tag[tag]
          if (array) array.push(node)
          else elements_by_tag[tag] = [node]
        }
        break
      case 3: // Node.TEXT_NODE
        text_nodes.push(node)
        break
    }
  }
  // 1) try to reuse the nodes from the previous loop or create those where no candidate is found
  let merged_children = []
  if (virtual_node.children) {
    for (let i = 0, n = virtual_node.children.length; i < n; i++) {
      let dom_child = null, virtual_child = virtual_node.children[i]
      if (typeof virtual_child === "string") {
        dom_child = text_nodes.shift() // try to recycle existing text-nodes
        if (!dom_child) dom_child = document.createTextNode(virtual_child)
      } else {
        // try to use matching keyed-nodes
        let key = virtual_child.attributes ? virtual_child.attributes["key"] : null
        if (key !== null) dom_child = nodes_by_key[key]
        if (dom_child) {
          delete nodes_by_key[key]
        } else {
          let tag = virtual_child.tag
          if (typeof tag === "function") {
            let tmp_component = instantiate(virtual_child),
              tmp_virtual_node = render(tmp_component)
            tag = tmp_virtual_node.tag
          }
          let array = elements_by_tag[tag]
          if (array) dom_child = array.shift()
        }
      }
      if (dom_child) { // morph dom_child to match virtual_child (recursively)
        merged_children.push(merge(virtual_child, dom_child))
      } else { // no suitable dom_child found -> create one (recursively)
        merged_children.push(create(virtual_child))
      }
    }
  }
  // 2) append or insert the merged_children
  for (let i = 0, len = merged_children.length; i < len; i++) {
    if (dom_node.childNodes[i] !== merged_children[i]) { // not already there
      let child = merged_children[i], next = dom_node.childNodes[i + 1]
      if (next) dom_node.insertBefore(child, next)
      else dom_node.appendChild(child)
    }
  }
  // 3) remove orphaned children
  for (let t in text_nodes) removeDomNode(text_nodes[t])
  for (let k in nodes_by_key) removeDomNode(nodes_by_key[k])
  for (let t in elements_by_tag) for (let e in elements_by_tag[t]) removeDomNode(elements_by_tag[t][e])
  return dom_node
}

/**
 * @type{Component[]}
 */
const _queue = []

/**
 * Base Class for all Components
 */
export class Component {
  constructor() {
    // the sole purpose of storing dom_node, attributes and children is to be able to
    // access them when update() is called! NEVER use them in actual components!
    /** @private */
    this._element = null
    /** @private */
    this._attributes = null
    /** @private */
    this._children = null
  }

  update() {
    let c, n = _queue.push(this)
    if (n === 1) requestAnimationFrame(() => {
      while (c = _queue.shift()) {
        if (c._element) merge(render(c), c._element)
      }
    })
  }

  /**
   * Internal: Receives new properties
   * Returns whether the Component *should* update afterwards
   * @param {null|Object} attributes
   * @param {null|VirtualNode[]} children
   * @returns {boolean}
   */
  setProperties(attributes, children) {
    let shall_update = false//!equals(attributes, this._attributes) || !equals(children, this._children)
    this._attributes = attributes
    this._children = children
    return shall_update
  }

  /**
   * @param {Object} attributes
   * @param {VirtualNode[]} children
   */
  render(attributes, children) {
    throw "NotImplementedError"
  }
}
