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

    constructor(type, sort = "POPULARITY_DESC", isAdult = false, format = "") {
        if (format != "") format = `, format: ${format}`;
        this.query = `
			query ($search_query: String) { 
				Media (search: $search_query, type: ${type}, sort: ${sort}, isAdult: ${isAdult}${format}) {
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
        let media = new Media();
        media.loadFromALData(returnData.data.Media);
        return media;
    }
}

export default AnilistAPI;
