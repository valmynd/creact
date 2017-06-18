import {Component} from '../../src/creact'

export class Canvas extends Component {
  componentWillMount() {
    this.scene = null
    this.camera = null
    this.renderer = null
  }

  componentDidMount() {
    let scene = new THREE.Scene()
    let camera = new THREE.PerspectiveCamera(75,  this._element.clientWidth /  this._element.clientHeight, 0.1, 1000)
    let renderer = new THREE.WebGLRenderer({canvas: this._element})
    let geometry = new THREE.BoxGeometry(1, 1, 1)
    let material = new THREE.MeshBasicMaterial({color: 0x00ff00})
    let cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    camera.position.z = 5

    let render = function () {
      //console.log(Math.random())
      if(Math.random() > 0.01) requestAnimationFrame(render)

      cube.rotation.x += 0.1
      cube.rotation.y += 0.1

      renderer.render(scene, camera)
    }
    render()
  }

  render({width = 100, height = 100}, children = []) {
    return <canvas width={width} height={height}>
    </canvas>
  }
}

export class Box extends Component {
  render(attributes = {}, children = []) {

  }
}
