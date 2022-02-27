import {Colors, Lightning} from "@lightningjs/sdk";

export default class TextWithBox extends Lightning.Component {

    static _template() {
        return {
            flex: {},
            Background: {
                flex: {},
                rtt: true, shader: {type: Lightning.shaders.RoundedRectangle, radius: 14},
                rect: true, color: 0xFFE50914,
                transitions: {
                    color: {duration: .6, timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'},
                    scale: {duration: .6, timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'}
                },
                Label: {
                    flexItem: {marginLeft: 20, marginRight: 20, marginTop: 7, marginBottom: 7},
                    text: {fontFace: "SourceSansPro-Regular", fontSize: 18, textColor: Colors('white').get(), fontStyle: 'bold'},
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

}