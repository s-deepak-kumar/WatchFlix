import {Lightning, Router, Utils} from '@lightningjs/sdk';
import ImageButton from "../components/ImageButton";

export default class MenuWithBackButton extends Lightning.Component {

    static _template() {
        return {
            TopHeader: {
                flex: {direction: "row"},
                BackButton: {
                    type: ImageButton, icon: "ic_back"
                },

            },
        };
    }

    _init() {
        this._index = 0;
    }

    _handleDown() {
        Router.restoreFocus();
    }

    _focus() {
        this.patch({
            TopHeader: {
                BackButton:{
                    smooth: {color: 0xFFE50914}
                }
            }
        });
    }

    _unfocus() {
        this.patch({
            TopHeader: {
                BackButton:{
                    smooth: {color: 0xff404249}
                }
            }
        });
    }

    _handleEnter() {
        Router.back();
    }

}