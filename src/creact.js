import {equals, render} from "./creact_utils";
import {merge, create, toString} from "./creact_dom"
export {merge, create, toString}
let _queue = []

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

  componentWillMount() {
    console.log("componentWillMount")
  }

  componentDidMount() {
    console.log("componentDidMount")
  }

  componentWillUnmount() {
    console.log("componentWillUnmount")
  }

  componentWillUpdate() {
    console.log("componentWillUpdate")
  }

  componentDidUpdate() {
    console.log("componentDidUpdate")
  }

  update() {
    this.componentWillUpdate()
    let n = _queue.push(this)
    if (n === 1) requestAnimationFrame(function () {
      let component
      while (component = _queue.pop()) {
        if (component._element) {
          merge(render(component), component._element)
          component.componentDidUpdate()
        }
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
    let shall_update = !equals(attributes, this._attributes) || !equals(children, this._children)
    this._attributes = attributes
    this._children = children
    return shall_update
  }

  /**
   * @param {null|Object} attributes
   * @param {null|VirtualNode[]} children
   */
  render(attributes, children) {
    throw "NotImplementedError"
  }
}
