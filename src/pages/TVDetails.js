import {Colors, Img, Lightning, Router} from '@lightningjs/sdk';
import {getFormattedDuration, getImgUrl} from "../lib/tools";
import Button from "../components/Button";
import TextWithBox from "../components/TextWithBox";
import CustomTextBox from "../components/CustomTextBox";
import ImageButton from "../components/ImageButton";

export default class TVDetails extends Lightning.Component{

    static _template() {
        return {
            x: 68, y: 200,
            flex: {direction: "column"},
            Header: {
                flex: {},
                PosterAndButton: {
                    flex: {direction: "column"},
                    Poster: {
                        flexItem: {marginRight: 40},
                        w: 300, h: 450,
                        shader: {type: Lightning.shaders.RoundedRectangle, radius: 16},
                        Image: {
                            w: w=>w, h: h=>h
                        }
                    },
                    Button: {
                        flexItem: {marginTop: 30},
                        type: Button, label: "Watch"
                    },
                },
                Details: {
                    flex: {direction: "column"},
                    x: 90,
                    transitions: {
                        x: {duration: 1, timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'}
                    },
                    IMDBRating: {
                        flexItem: {},
                        type: TextWithBox, label: "★  7.9"
                    },
                    ReleaseAndDuration: {
                        y: 10,
                        flex: {direction: "row"},
                        ReleaseDate: {
                            text: {
                                text: "2021-2022",
                                fontSize: 22,
                            },
                        },
                        Duration: {
                            x: 10,
                            text: {textColor: Colors("white").get(), text: " •  1 hr 20 min", fontSize: 22, fontFace: "SourceSansPro-Regular",  maxLines: 1},
                        },
                    },
                    Title: {
                        text: {fontSize: 64, fontFace: "SourceSansPro-Bold", wordWrapWidth: 960, maxLines: 2, lineHeight: 50}
                    },
                    Overview: {
                        color: 0xFFD3D3D3, text: {fontSize: 22, fontFace: "SourceSansPro-Regular", wordWrapWidth: 960, lineHeight: 38}
                    },
                    GenreLayout: {
                        y: 10,
                        flex: {direction: "row"},
                        GenreTitle: {
                            flexItem: {},
                            type: CustomTextBox, label: "Genre"
                        },
                        Genres: {
                            x: 10,
                            text: {textColor: Colors("white").get(), fontSize: 20, fontFace: "SourceSansPro-Regular",  maxLines: 1},
                        }
                    },
                    CastLayout: {
                        y: 20,
                        flex: {direction: "row"},
                        CastTitle: {
                            flexItem: {},
                            type: CustomTextBox, label: "Cast"
                        },
                        Casts: {
                            x: 10,
                            text: {textColor: Colors("white").get(), fontSize: 20, fontFace: "SourceSansPro-Regular",  maxLines: 1},
                        }
                    },
                    CreatorLayout: {
                        y: 30,
                        flex: {direction: "row"},
                        DirectorTitle: {
                            flexItem: {},
                            type: CustomTextBox, label: "Creators"
                        },
                        Creators: {
                            x: 10,
                            text: {textColor: Colors("white").get(), fontSize: 20, fontFace: "SourceSansPro-Regular",  maxLines: 1},
                        }
                    },
                    OriginalNetworkLayout: {
                        y: 40,
                        flex: {direction: "row"},
                        WriterTitle: {
                            flexItem: {},
                            type: CustomTextBox, label: "Original Network"
                        },
                        OriginalNetwork: {
                            x: 10,
                            text: {textColor: Colors("white").get(), fontSize: 22, fontFace: "SourceSansPro-Regular",  maxLines: 1},
                        }
                    },
                    LanguageLayout: {
                        y: 50,
                        flex: {direction: "row"},
                        LanguageTitle: {
                            flexItem: {},
                            type: CustomTextBox, label: "Language"
                        },
                        Language: {
                            x: 10,
                            text: {textColor: Colors("white").get(), fontSize: 22, fontFace: "SourceSansPro-Regular",  maxLines: 1},
                        }
                    },
                    TotalSeasonLayout: {
                        y: 60,
                        flex: {direction: "row"},
                        LanguageTitle: {
                            flexItem: {},
                            type: CustomTextBox, label: "Total Season"
                        },
                        TotalSeasons: {
                            x: 10,
                            text: {textColor: Colors("white").get(), fontSize: 22, fontFace: "SourceSansPro-Regular",  maxLines: 1},
                        }
                    },
                    TotalEpisodeLayout: {
                        y: 60,
                        flex: {direction: "row"},
                        LanguageTitle: {
                            flexItem: {},
                            type: CustomTextBox, label: "Total Episodes"
                        },
                        TotalEpisodes: {
                            x: 10,
                            text: {textColor: Colors("white").get(), fontSize: 22, fontFace: "SourceSansPro-Regular",  maxLines: 1},
                        }
                    },
                }
            }
        };
    }

    _active() {
        this.widgets.menu.visible = false;
        this.application.emit("setItem", this._details);

        this.patch({
            Header: {
                Details: {
                    smooth: {x: 40}
                }
            }
        });

        this._refocus();
    }

    _inactive() {
        this.tag("Details").setSmooth("x", 90);
    }

    set details(v) {
        this._details = v[0];
        this._credits = v[1];

        const image = getImgUrl(this._details.poster, 500);

        const genres = this._details.genres.map((genre, index) => {
            if (index < 4) {return genre.name}
        }).filter(item => item).join(" • ");

        const casts = this._credits.cast.map((cast, index) => {
            if (index < 6) {return cast.name}
        }).filter(item => item).join(", ");

        const creators = this._details.created_by.map((creator, index) => {
            if (index < 4) {return creator.name}
        }).filter(item => item).join(", ");

        const originalNetworks = this._details.original_network.map((network, index) => {
            if (index < 4) {return network.name}
        }).filter(item => item).join(", ");

        const languages = this._details.spokenLanguages.map((language, index) => {
            if (index < 2) {return language.name}
        }).filter(item => item).join(", ");

        this.patch({
            Header: {
                PosterAndButton: {
                    Poster: {
                        Image: {
                            texture: Img(image).contain(300, 450)
                        }
                    },
                },
                Details: {
                    IMDBRating: {
                        label: "★  " + this._details.voteAverage
                    },
                    ReleaseAndDuration: {
                        ReleaseDate: {
                            text: {text: this.getYear(new Date(this._details.first_release_date).getFullYear(), new Date(this._details.last_release_date).getFullYear())}
                        },
                        Duration: {
                            text: {text: " •  " + getFormattedDuration(this._details.runtime)}
                        }
                    },
                    Title: {
                        text: {text: this._details.title}
                    },
                    Overview: {
                        text: {text: this._details.overview}
                    },
                    GenreLayout: {
                        Genres: {
                            text: {text: genres}
                        },
                    },
                    CastLayout: {
                        Casts:{
                            text: {text: casts}
                        }
                    },
                    CreatorLayout: {
                        Creators: {
                            text: {text: creators}
                        }
                    },
                    OriginalNetworkLayout: {
                        OriginalNetwork: {
                            text: {text: originalNetworks}
                        }
                    },
                    LanguageLayout: {
                        Language: {
                            text: {text: languages}
                        }
                    },
                    TotalSeasonLayout: {
                        TotalSeasons: {
                            text: {text: this._details.total_seasons}
                        }
                    },
                    TotalEpisodeLayout: {
                        TotalEpisodes: {
                            text: {text: this._details.total_episodes}
                        }
                    }
                }
            }
        });
    }


    /*duration(min){
       if (min != null || min !== 0){
           const hours = Math.floor(min / 60);
           const minutes = min % 60;
           return hours + " hr" + " " + minutes + " min";
       }else{
           return "null";
       }
   }*/

    getYear(firstReleaseDate, lastReleaseDate){
        return firstReleaseDate === lastReleaseDate ? firstReleaseDate : firstReleaseDate + "-" + lastReleaseDate
    }

    _handleUp() {
        Router.focusWidget("MenuWithBackButton");
    }

    _getFocused() {
        return this.tag("Button");
    }

}