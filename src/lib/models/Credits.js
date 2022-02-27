export default class Details {
    constructor(obj){
        this._id = obj.id;
        this._cast = obj.cast;
        this._crew = obj.crew;
    }

    get id() {
        return this._id;
    }

    get cast() {
        return this._cast;
    }

    set cast(value) {
        this._cast = value;
    }

    get crew() {
        return this._crew;
    }

    set crew(value) {
        this._crew = value;
    }
}