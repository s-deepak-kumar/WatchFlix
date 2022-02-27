import {Lightning, Router} from "@lightningjs/sdk";

export default class Button extends Lightning.Component {

    static _template() {
        return {
            flex: {},
            Background: {
                flex: {},
                w: 300,
                rtt: true, shader: {type: Lightning.shaders.RoundedRectangle, radius: 14},
                rect: true, color: 0xff404249,
                transitions: {
                    color: {duration: .6, timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'},
                    scale: {duration: .6, timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'}
                },
                Label: {
                    flexItem: {marginLeft: 115, marginRight: 115, marginTop: 10, marginBottom: 7},
                    text: {fontFace: "SourceSansPro-Regular", fontSize: 25},
                    transitions: {
                        color: {duration: .6, timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'},
                        scale: {duration: .6, timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'}
                    }
                }
            }
        };
    }

    set label(v) {
        this._label = v;

        this.tag("Label").patch({
            text: {text: this._label}
        });
    }

    _focus() {
        this.patch({
            Background: {
                smooth: {color: 0xFFE50914},
                Label: {
                    smooth: {color: 0xffffffff},
                }
            }
        });
    }

    _unfocus() {
        this.patch({
            Background: {
                smooth: {color: 0xff404249},
                Label: {
                    smooth: {color: 0xffffffff},
                }
            }
        });
    }

    _handleEnter() {
       // const {id, media_type} = this._data;
        Router.navigate('player', {keepAlive: false});
    }

}