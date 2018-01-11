import {Component} from "../creact"
import {layout} from "./layout"
import {Box2D} from "./svgcomponents"

export function assert(condition) {
  if(!condition) throw new Error("AssertionError")
}

export class Node2D extends Component {
  render(attributes, children) { // should have only width and height, x and y are calculated
    assert(attributes.width != null && attributes.height != null) // attributes.x == null && attributes.y == null
    return <Box2D {...attributes}>{children}</Box2D>
  }
}

export class Tree2D extends Node2D {
  render(attributes, children) { // should have only x and y set, width and height are calculated
    assert(attributes.x != null && attributes.y != null) // attributes.width == null && attributes.height == null
    return layout(<g {...attributes}>{children}</g>)
  }
}
