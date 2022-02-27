import { Lightning } from '@lightningjs/sdk'

export default class NoiseShader extends Lightning.shaders.WebGLDefaultShader {
  constructor(context) {
    super(context)
    this._time = 0
  }

  set time(v) {
    this._time = v
    this.redraw()
  }

  setupUniforms(operation) {
    super.setupUniforms(operation)

    const owner = operation.shaderOwner
    const renderPrecision = this.ctx.stage.getRenderPrecision()
    this._setUniform('time', this._time, this.gl.uniform1f)
    this._setUniform(
      'resolution',
      new Float32Array([owner._w * renderPrecision, owner._h * renderPrecision]),
      this.gl.uniform2fv
    )
  }
}

NoiseShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif

    #define PI 3.14159265359

    varying vec2 vTextureCoord;
    varying vec4 vColor;

    uniform sampler2D uSampler;
    uniform vec2 resolution;
    uniform float time;

    float random (in vec2 st, in float time) {
      return fract(sin(dot(st.xy,
                           vec2(12.9898,78.233)))
                   * (43758.5453123 + time/10.0));
    }

    void main() {
        vec4 color = texture2D(uSampler, vTextureCoord) * vColor;

        float random = random(vTextureCoord.xy/2.5, time);
        color = vec4(random * random * random * random);

        gl_FragColor = color;
    }
`
