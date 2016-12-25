/**
 * @typedef {string|Object} VirtualNode
 * @property {string|function} tag
 * @property {Object} [attributes]
 * @property {VirtualNode[]} [children]
 * @property {Component} [component]
 */


/**
 * Render a Virtual DOM Node to a String
 * @param {VirtualNode} virtual_node
 * @returns {string}
 */
export function toString(virtual_node) {
  if (typeof virtual_node.tag === 'function')
    virtual_node = render(instantiate(virtual_node))
  let tag = virtual_node.tag, children = virtual_node.children, attributes = virtual_node.attributes
  let ret = "<" + tag
  if (attributes) {
    for (let key in attributes) {
      if (!key.startsWith("on")) ret += " " + key + '="' + attributes[key] + '"'
    }
  }
  ret += ">"
  if (children) {
    for (let i = 0, n = children.length; i < n; i++) {
      if (typeof children[i] === "string") ret += children[i]
      else ret += toString(children[i])
    }
  }
  return ret + "</" + tag + ">"
}

/**
 * @param {Object|Array|null} one
 * @param {Object|Array|null} other
 * @returns {boolean}
 */
export function equals(one, other) {
  if (!one) return !other
  if (one.length !== other.length) return false
  for (let a in one)
    if (one[a] !== other[a])
      return false
  return true
}

/**
 * @param {Node} old_dom_node
 * @param {Node} new_dom_node
 * @returns {Node}
 */
export function replaceDomNode(old_dom_node, new_dom_node) {
  cleanup(old_dom_node)
  let parent = old_dom_node.parentNode
  if (parent)  parent.replaceChild(new_dom_node, old_dom_node)
  return new_dom_node
}

/**
 * @param {Node} dom_node
 */
export function removeDomNode(dom_node) {
  cleanup(dom_node)
  let parent = dom_node.parentNode
  if (parent) parent.removeChild(dom_node)
}

/**
 * @param {VirtualNode} virtual_node
 * @returns {Component}
 */
export function instantiate(virtual_node) {
  let component = new virtual_node.tag()
  component._attributes = virtual_node.attributes
  component._children = virtual_node.children
  return component
}

/**
 * @param {Component} component
 * @returns {VirtualNode}
 */
export function render(component) {
  return component.render(component._attributes, component._children)
}

/**
 * @param {Node} dom_node
 * @param {Component} component
 */
export function link(dom_node, component) {
  if (dom_node._component) unlink(dom_node, dom_node._component)
  if (component.componentWillMount) component.componentWillMount()
  dom_node._component = component
  component._element = dom_node
}

/**
 * @param {Node} dom_node
 * @param {Component} component
 */
function unlink(dom_node, component) {
  if (component.componentWillUnmount) component.componentWillUnmount()
  if (dom_node._component) delete dom_node._component
  if (component._element) delete component._element
}

function proxyEventHandler(event) {
  return event.currentTarget._listeners[event.type].call(this, event)
}

/**
 * Add or override an event listener for a DOM Node
 * @param {Node} dom_node
 * @param {string} event_name
 * @param {function} listener
 */
export function setListener(dom_node, event_name, listener) {
  if (!dom_node._listeners) {
    dom_node._listeners = {}
    dom_node._listeners[event_name] = listener
    dom_node.addEventListener(event_name, proxyEventHandler)
  } else {
    if (!dom_node._listeners[event_name])
      dom_node.addEventListener(event_name, proxyEventHandler)
    dom_node._listeners[event_name] = listener
  }
}

/**
 * Remove an event listener for a DOM Node
 * @param {Node} dom_node
 * @param {string} event_name
 */
export function removeListener(dom_node, event_name) {
  dom_node.removeEventListener(event_name, proxyEventHandler)
  delete dom_node._listeners[event_name]
}

/**
 * Removes Event Listener- and Component-Links recursively
 * @param {Node} dom_node
 */
function cleanup(dom_node) {
  if (dom_node._component) unlink(dom_node, dom_node._component)
  if (dom_node._listeners) {
    for (let event_name in dom_node._listeners) removeListener(dom_node, event_name)
    delete dom_node._listeners
  }
  if (dom_node.children) for (var i = 0, n = dom_node.children.length; i < n; i++)
    cleanup(dom_node.children[i])
}
