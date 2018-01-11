import {Circle2D, Node2D, Tree2D} from "./layoutcomponents"

export const example = <Tree2D name="tree" x={100} y={100}>
  <Node2D name="exampleClass" width={10} height={10}>
    <Node2D name="exampleSubClass" width={10} height={10}>
      <Circle2D name="someBox" width={10} height={10}/>
    </Node2D>
  </Node2D>
</Tree2D>


let out = {
  "attributes": {"width": 10, "height": 33, "x": 0, "y": 0},
  "children": [{
    "attributes": {"x": -5, "y": 1, "name": "exampleClass", "width": 10, "height": 10},
    "children": [{
      "attributes": {"x": -5, "y": 12, "name": "exampleSubClass", "width": 10, "height": 10},
      "children": [{
        "attributes": {"x": -5, "y": 23, "name": "someBox", "width": 10, "height": 10},
        "children": []
      }]
    }]
  }]
}
