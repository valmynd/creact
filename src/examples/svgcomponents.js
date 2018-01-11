import {assert} from "./layoutcomponents"
import {Component} from "../creact"

const rectDefaults = {
  fill: "white",
  stroke: "black"
}

/**
 * The actual magic happens in checkIfRect()!
 * @extends {Node2D} // avoid circular import
 */
export class Box2D extends Component {
  render(attributes, children) {
    assert(attributes.width != null && attributes.height != null, children == null)
    return <rect {...attributes}>{children}</rect>
  }
}

export class Circle2D extends Box2D {
  render(attributes, children) {
    assert(attributes.width != null && attributes.height != null, children == null)
    return <circle {...attributes}>{children}</circle>
  }
}
