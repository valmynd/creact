/**
 * @abstract
 */
class Function {
}

/**
 * @abstract
 */
class Shader extends Function {
  /**
   * Assign Mesh responsible for that Shader
   * @param {Mesh} mesh
   */
  constructor(mesh) {
    super()
    this.ins = []
    this.outs = []
    this.uniforms = mesh.uniforms
  }

  toString() {
    let shader = "#version 300 es\nin vec4 position;\nin vec4 normal;\nin vec4 uv;"
    for (let {type, name} of this.uniforms) shader += "uniform " + type + " " + name + ";\n"
    for (let {type, name} of this.ins) shader += "in " + type + " " + name + ";\n"
    for (let {type, name} of this.outs)shader += "uniform " + type + " " + name + ";\n"
    return shader + super.toString()
  }
}

class VertexShader extends Shader {
  constructor(mesh) {
    super(mesh)
    // derive outs from state
  }
}

class PixelShader extends Shader {
  constructor(mesh) {
    super(mesh)
    // derive ins from state + compare with outs from vertexShader to avoid errors
  }
}

class Mesh {
  /**
   * @example DSL
   *
   * vertex(position, normal, uv, uniforms, state) {
   *    state.set(r=1, b=0, g=0) // forwarded to pixel-shader
   *    return uniforms.projection * uniforms.view * uniforms.model * [...position, 0] // gl_Position
   * }
   *
   * pixel(position, normal, uv, uniforms, state) {
   *    return [state.r, state.g, state.b]
   * }
   *
   * @example Usage
   *
   * new Mesh([...],
   *          [...],
   *          [...],
   *          {model: [...], view: [...], projection: [...]},
   *          new VertexShader(this),
   *          new PixelShader(this))
   *
   * @param {WebGLRenderingContext} gl
   * @param {Float32Array} vertices
   * @param {Float32Array} normals
   * @param {Float32Array} uvs
   * @param {object} uniforms
   * @param {Shader} vertexShader
   * @param {Shader} fragmentShader
   */
  constructor(gl, vertices, normals, uvs, uniforms, vertexShader, fragmentShader) {
    this.gl = gl
    this.vertices = vertices
    this.normals = normals
    this.uvs = uvs
    this.uniforms = uniforms
    this.vertexShader = vertexShader
    this.fragmentShader = fragmentShader
  }
}
