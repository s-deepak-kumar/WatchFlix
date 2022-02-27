import {Colors, Lightning, Utils} from '@lightningjs/sdk'

export default class ImageButton extends Lightning.Component {
    static _template() {
        return {
            h: 80,
            w: 80,
            color: 0xff404249,
            rect: true,
            rtt: true, shader: {type: Lightning.shaders.RoundedRectangle, radius: 40},
            Icon: {
                w: 30,
                h: 30,
                x: 25,
                y: 25,
            },
            Label: {
                x: w => w / 2,
                y: h => h / 2,
                mount: 0.5,
                text: {
                    text: '',
                    textColor: 0xff000000,
                },
            },
        }
    }

    set index(v) {
        this.x = v * 70
    }

    set icon(v) {
        if (v) {
            this.tag('Icon').src = Utils.asset('images/' + v + '.png')
        }
    }

    set label(v) {
        if (v) {
            this.tag('Label').text.text = v
        }
    }

    _handleEnter() {
        this.action && this.fireAncestors(this.action)
    }

    _focus() {
        this.setSmooth('color', 0xFFE50914)
    }

    _unfocus() {
        this.setSmooth('color', 0xff404249)
    }
}
