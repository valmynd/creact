import {Component} from "../../src/creact"
import {Canvas} from "./CanvasGL"
export {Canvas}

export class Box extends Component {
  render({width = 10, height = 10, depth = 10}, children = []) {
    // read http://www.paridebroggi.com/2015/06/optimized-cube-opengl-triangle-strip.html
    // read http://www.corehtml5.com/trianglestripfundamentals.php
    let w = width / 2, h = height / 2, d = depth / 2
    let ret = <geometry
      vertices={[
        -w, -h, -d, -w, +h, -d, +w, +h, -d, +w, -h, -d,
        -w, -h, +d, -w, +h, +d, +w, +h, +d, +w, -h, +d,
        -w, -h, -d, -w, -h, +d, -w, +h, +d, -w, +h, -d,
        +w, -h, -d, +w, -h, +d, +w, +h, +d, +w, +h, -d,
        -w, +h, -d, -w, +h, +d, +w, +h, +d, +w, +h, -d,
        -w, -h, -d, -w, -h, +d, +w, -h, +d, +w, -h, -d
      ]}
      normals={[
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0
      ]}
      uvs={[
        1, 0, 1, 1, 0, 1, 0, 0,
        0, 0, 0, 1, 1, 1, 1, 0,
        0, 0, 1, 0, 1, 1, 0, 1,
        1, 0, 0, 0, 0, 1, 1, 1,
        0, 1, 0, 0, 1, 0, 1, 1,
        0, 0, 0, 1, 1, 1, 1, 0
      ]}
    />
    console.log(ret)
    return ret
  }
}

function triangle_strip_grid() {
  let cols = 4, rows = 3;

  function initializeGrid(cols, rows) {
    let trianglestrip = []
    let RCvertices = 2 * cols * (rows - 1) // Number of vertexes needed for grid
    for (let i = 1, j = 0; i <= RCvertices; i += 2) {
      trianglestrip[j] = (1 + i) / 2 // ODD numbers
      trianglestrip[j + 1] = (cols * 2 + i + 1) / 2 // EVEN numbers
      if (trianglestrip[j + 1] % cols == 0) {
        if (trianglestrip[j + 1] != cols && trianglestrip[j + 1] != cols * rows) {
          trianglestrip[j + 2] = trianglestrip[j + 1]
          trianglestrip[j + 3] = (1 + i + 2) / 2
          j += 2;
        }
      }
      j += 2;
    }
  }
}
