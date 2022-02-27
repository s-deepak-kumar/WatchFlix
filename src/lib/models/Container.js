import {Movie, Tv} from "./";
import {getRuntime} from "../api";

export default class Container {
    constructor(obj, type, genres){
        this._page = obj.page;
        this._total_results = obj.total_results;
        this._type = type;
        this._items = obj.results.map(item => {
            switch (type) {
                case "movie":
                    let movie = new Movie(item, genres);
                    //movie.runtime = runtime
                    return movie;
                case "tv":
                    return new Tv(item, genres);
            }
        });
    }

    get page() {
        return this._page;
    }

    get total() {
        return this._total_results;
    }

    get type() {
        return this._type;
    }

    get items() {
        return this._items;
    }
}