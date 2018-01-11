import {Component} from "../creact"
import {layout} from "./layout"

function assert(condition) {
  if(!condition) throw `AssertionError: ${condition} not satisfied`
}

export class Node2D extends Component {
  render(attributes, children) { // should have only width and height, x and y are calculated
    assert(attributes.x == null && attributes.y == null && attributes.width != null && attributes.height != null)
    return <rect {...attributes}>
      {children}
    </rect>
  }
}

export class Box2D extends Node2D {
  render(attributes, children) { // should also have width and height, may also have x and y set, but the latter should only be the case when used in other contexts
    assert(attributes.width != null && attributes.height != null)
    return <rect {...attributes}>
      {children}
    </rect>
  }
}

export class Tree2D extends Node2D {
  render(attributes, children) { // should have only x and y set, width and height are calculated
    assert(attributes.x != null && attributes.y != null && attributes.width == null && attributes.height == null)
    return layout(<Node2D {...attributes}>{children}</Node2D>)
  }
}
