export const getImgUrl = (imgPath, width = 185)=> {
    return `//image.tmdb.org/t/p/w${width}${imgPath}`
};

export const getFormattedDuration = (min)=> {
    if (min != null || min !== 0){
        const hours = Math.floor(min / 60);
        const minutes = min % 60;
        return hours !== 0 ? hours + " hr" + " " + minutes + " min" : minutes + " min";
    }else{
        return "null";
    }
}