import fetch from "node-fetch";
import logger from "../logger.js";
import Media from "./media.js";

class AnilistAPI {
    static Types = {
        MANGA: "MANGA",
        ANIME: "ANIME",
    };

    static Sorts = {
        POPULARITY_DESC: "POPULARITY_DESC",
    };

    static Formats = {
        NOVEL: "NOVEL",
    };

    query = ``;
    url = "https://graphql.anilist.co";

    constructor(type, sort = "", isAdult = false, format = "") {
        if (sort != "") sort = `, sort: ${sort}`;
        if (format != "") format = `, format: ${format}`;
        let adult = `, isAdult: ${isAdult}`;
        this.query = `
			query ($search_query: String) { 
				Media (search: $search_query, type: ${type}${sort}${adult}${format}) {
					id,
					idMal,
					title {
						romaji
						english
						native
					},
					description,
					status,
					chapters,
					volumes,
					genres,
					format,
    				episodes,
					coverImage{
						extraLarge,
						color
					},
					staff {
						edges {
							node {
								name {
									full
								}
							}
							role
						}
					},
					nextAiringEpisode {
						timeUntilAiring,
						episode
					}
				}
			}
        `;
    }

    /**
     * @param {object} vars
     * @return {object}
     */
    options(vars) {
        return {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                query: this.query,
                variables: vars,
            }),
        };
    }

    /**
     * @param {string} search_query
     * @return {Promise<Media|null>}
     */
    async search(search_query) {
        let opt = this.options({ search_query: search_query });
        let returnData = null;
        await fetch(this.url, opt)
            .then((response) => {
                return response.json().then(function (json) {
                    return response.ok ? json : Promise.reject(json);
                });
            })
            .then((data) => {
                console.log(`[AniList Search] ✔️ '${search_query}' Sucess.`);
                returnData = data;
            })
            .catch((error) => {
                if (error.errors && error.errors.length > 0 && error.errors[0].status == 404) {
                    console.log(`[AniList Search] ❗  '${search_query}' Not Found.`);
                }
                logger.error(error, `Error while searching AniList for '${search_query}'. HTTP Response:`);
                console.log(`[AniList Search] ❌  '${search_query}'. Check Logs.`);
            });
        if(returnData == null) return null;
        return AnilistAPI.parseToMedia(returnData.data.Media);
    }

    static parseToMedia(data){
        let media = new Media();
        media.al_url = `https://anilist.co/manga/${data.id}`;
        media.mal_url = `https://myanimelist.net/manga/${data.idMal}`;
        media.title = { ...data.title };
        media.description = data.description?.replace(/<\/?[^>]+(>|$)/g, "");
        media.status = data.status;
        media.chapters = data.chapters;
        media.volumes = data.volumes;
        media.genres = data.genres?.join(", ");
        media.format = data.format;
        media.episodes = data.episodes;
        media.image_url = data.coverImage?.extraLarge;

        let a = data.staff?.edges?.find((s) => s.role?.toLowerCase().includes("story"));
        if (a) media.author = a.node?.name?.full;

        media.nextEpisode = {
            timeUntil: data.nextAiringEpisode?.timeUntilAiring,
            episode: data.nextAiringEpisode?.episode,
        };
        return media;
    }
}

export default AnilistAPI;
