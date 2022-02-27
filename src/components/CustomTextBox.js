import {Colors, Lightning} from "@lightningjs/sdk";

export default class CustomTextBox extends Lightning.Component {

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
                    flexItem: {marginLeft: 10, marginRight: 10, marginTop: 5, marginBottom: 0},
                    text: {fontFace: "SourceSansPro-Regular", fontSize: 16, textColor: Colors('white').get(), fontStyle: 'bold'},
                    transitions: {
                        color: {duration: .6, timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'},
                        scale: {duration: .6, timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'}
                    }
                },
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