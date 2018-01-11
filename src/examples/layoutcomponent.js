import {Component} from "../creact"
import {layout} from "./layout"


export class Node2D extends Component {
  render({width, height}, children) { // should have only width and height, x and y are calculated
    return <rect width={width} height={height}>
      {children}
    </rect>
  }
}

export class Box2D extends Node2D {
  render({x, y, width, height}, children) { // should also have width and height, may also have x and y set, but the latter should only be the case when used in other contexts
    return <rect x={x} y={y} width={width} height={height}>
      {children}
    </rect>
  }
}

export class Tree2D extends Node2D {
  render({x, y}, children) { // should have only x and y set, width and height are calculated
    return layout(<Node2D x={x} y={y}>{children}</Node2D>)
  }
}
