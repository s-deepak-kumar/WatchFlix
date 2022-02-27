import {Colors, Lightning} from '@lightningjs/sdk'
import { formatTime } from '../lib/helpers'

export default class ProgressBar extends Lightning.Component {
  static _template() {
    return {
      h: 30,
      w: w => w,
      Progress: {
        color: 0xff404249,
        rect: true,
        w: w => w - 200,
        h: h => h,
        shader: {type: Lightning.shaders.RoundedRectangle, radius: 15},
        InnerProgress: {
          rect: true,
          color: 0xFFE50914,
          x: 8,
          w: 0,
          y: h => (h - 16) / 2,
          h: 16,
          shader: {type: Lightning.shaders.RoundedRectangle, radius: 8},
        },
      },
      Timer: {
        color: 0xFFE50914,
        x: w => w - 180,
        w: 180,
        rect: true,
        h: 30,
        shader: {type: Lightning.shaders.RoundedRectangle, radius: 15},
        Text: {
          x: 32,
          y: 3,
          text: {
            textColor: Colors('white').get(),
            fontSize: 20,
            fontStyle: "bold",
          },
        },
      },
    }
  }

  set progress(v) {
    this.tag('Progress.InnerProgress').setSmooth('w', (this.renderWidth - 16) * v)
  }

  set duration(v) {
    this._duration = v
  }

  get duration() {
    return this._duration || 0.0001
  }

  set currentTime(v) {
    const ratio = Math.round((v / this.duration) * 1000) / 1000
    this.tag('Progress.InnerProgress').setSmooth(
      'w',
      (this.tag('Progress').renderWidth - 16) * ratio
    )
    this.tag('Timer.Text').text = [formatTime(v || 0), formatTime(this.duration || 0)].join(' / ')
  }
}
