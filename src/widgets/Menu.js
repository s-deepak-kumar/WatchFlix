import {Colors, Lightning, Router, Utils} from '@lightningjs/sdk';

export default class Menu extends Lightning.Component {

    static _template() {
        return {
            TopHeader: {
                flex: {direction: "row"},
                Logo: {
                    w: 214,
                    h: 52,
                    src: Utils.asset("images/logo.png"),
                },
                MenuItems: {
                    x: 100,
                    Items: {
                        //y: 68,
                        flex: {},
                    },
                    Focus: {
                        rect: true, colorLeft: 0xFFE50914, colorRight: 0xFFE50914,
                        h: 6, y: 39,
                        rtt: true, shader: {type: Lightning.shaders.RoundedRectangle, radius: 3},
                        transitions: {
                            alpha: {duration: .3, timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'},
                            w: {duration: .3, timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'}
                        }
                    }
                }
            },
        };
    }

    _init() {
        this._index = 0;
    }

    get activeItem() {
        return this.tag("Items").children[this._index];
    }

    _handleDown() {
        Router.restoreFocus();
        this._selectedChild.selected = true
    }

    _handleLeft() {
        if (this._index > 0) {
            this._select(-1);
        }
    }

    _handleRight() {
        //console.log(this.tag("Items").children.length)
        if (this._index < this.tag("Items").children.length - 1) {
            this._select(1);
        }
    }

    _focus() {
        this.tag("Focus").w = 0;
        this.tag("Focus").setSmooth("alpha", 1);
        this._animateToSelected();
    }

    _unfocus() {
        this.tag("Focus").setSmooth("alpha", 0);
    }

    _select(direction) {
        this._index += direction;
        if (this._index < this.tag("Items").children.length) {
            this._animateToSelected();
        }
    }

    _animateToSelected() {
        this.tag("Focus").patch({
            smooth: {x: this.activeItem.finalX, w: this.activeItem.finalW}
        });
    }

    _handleEnter() {
        if(this.activeItem.id === 'exit') {
            this.application.closeApp();
        }
        else {
            Router.navigate(`${this.activeItem.id}`, false);
            Router.restoreFocus();
        }
    }

    _getFocused(){
        return this.activeItem;
    }

    _setup() {
        this._items = ['Movies', 'TV Shows', 'Sports', 'Exit'];
        const items = this._items.map((item) => {
            return { type: MenuItem, label: item, selected: false, id: item.toLocaleLowerCase()};
        });
        this.tag('Items').add(items);
    }

    _onActivated(page) {
        const list = this.tag('Items');
        const currentRouteId  = page[Router.symbols['route']].toLocaleLowerCase();

        for (let i = 0; i < list.children.length; i++) {
            list.children[i].selected = list.children[i]._id === currentRouteId
            if (list.children[i]._id === currentRouteId){
                this._selectedChild = list.children[i];
            }
        }
    }

}

class MenuItem extends Lightning.Component {

    static _template() {
        return {
            flexItem: {marginRight: 25},
            text: {text: "Home", fontSize: 25, fontFace: "SourceSansPro-Regular", fontStyle: "bold"}
        };
    }

    set label(v) {
        this._label = v;

        this.patch({
            text: {text: this._label}
        });
    }

    set id(v) {
        this._id = v.replace(/ /g, "");
    }

    get id() {
        return this._id;
    }

    set selected(bool) {
        if (bool){
            this.patch({
                text: {textColor: 0xFFE50914, alpha: 0.6}
            });
        }else {
            this.patch({
                text: {textColor: Colors('white').get(), alpha: 1}
            });
        }
        this._selected = bool;
    }

    get selected() {
        return this._selected;
    }

    _focus() {
        this.patch({
            text: {textColor: 0xFFE50914}
        });
    }

    _unfocus() {
        this.patch({
            text: {textColor: Colors('white').get()}
        });
    }
}