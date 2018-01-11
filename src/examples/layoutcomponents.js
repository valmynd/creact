import {circleDefaults, rectDefaults} from "../svg_utils"
import {Component} from "../creact"
import {layout} from "./layout"

export function assert(condition) {
  if (!condition) throw new Error("AssertionError")
}

export class Node2D extends Component {
  render(attributes, children) { // should have only width and height, x and y are calculated
    assert(attributes.width != null && attributes.height != null) // attributes.x == null && attributes.y == null
    return <g>
      <Box2D {...attributes}/>
      {children}
    </g>
  }
}

export class Box2D extends Node2D {
  render(attributes, children) {
    assert(attributes.width != null && attributes.height != null, children == null)
    return <rect {...rectDefaults} {...attributes}/>
  }
}

export class Circle2D extends Node2D {
  render(attributes, children) {
    assert(attributes.width != null && attributes.height != null, children == null)
    return <circle {...circleDefaults} {...attributes}/>
  }
}

export class Tree2D extends Node2D {
  render(attributes, children) { // should have only x and y set, width and height are calculated
    assert(attributes.x != null && attributes.y != null) // attributes.width == null && attributes.height == null
    return layout(<g {...attributes}>{children}</g>)
  }
}
