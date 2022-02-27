import {Router, TV} from "@lightningjs/sdk";

import {
    NotFound, Error, Main, Details, Splash, TVDetails, Player
} from '../pages';
import {getDetailPage, getDetails, getMovies, getSportMovies, getTv} from "./api";



// export default () =>{
//     Router.root('splash', Splash);
//
//     Router.route('movies', Main);
//     Router.route('tv', Main);
//     Router.route('details/:itemType/:itemId', Details);
//
//     Router.start();
// }

export default {
    root: "splash",
    routes: [
        {
            path: 'splash',
            component: Splash
        },
        /*{
            path: 'home',
            component: Main,
            before: async(page)=>{
                const main = await getMovies();
                page.main = main;
            },
            widgets:["Menu"],
        },*/
        {
            path: 'movies',
            component: Main,
            before: async(page)=>{
                const main = await getMovies();
                page.main = main;
            },
            widgets:["Menu"],
        },
        {
            path: 'tvshows',
            component: Main,
            before: async (page) =>{
                const main = await getTv();
                page.main = main;
            },
            widgets:["Menu"],
        },
        {
            path: 'sports',
            component: Main,
            before: async(page)=>{
                const main = await getSportMovies();
                page.main = main;
            },
            widgets:["Menu"],
        },
        {
            path: 'details/movie/:itemId',
            component: Details,
            before: async (page, {itemId}) =>{
                const details = await getDetails("movie", itemId);
                page.details = details;
            },
            widgets:["MenuWithBackButton"],
        },
        {
            path: 'details/tv/:itemId',
            component: TVDetails,
            before: async (page, {itemId}) =>{
                const details = await getDetails("tv", itemId);
                page.details = details;
            },
            widgets:["MenuWithBackButton"],
        },
        {
            path: 'player',
            component: Player,
        },
        {
            path: '*',
            component: NotFound,
        },
        {
            path: '!',
            component: Error
        }
    ],
}

/*
export const applyPlayerModel = (item) => {
    const {id, title, name, media_type, images: {backdrops}} = item;
    const backdropPath = backdrops.length > 0 ? backdrops[Math.min(1, backdrops.length-1)].file_path : '';
    return {
        id,
        title: media_type === 'tv' ? name : title,
        backdrop: `http://image.tmdb.org/t/p/original/${backdropPath}`
    }
}*/
