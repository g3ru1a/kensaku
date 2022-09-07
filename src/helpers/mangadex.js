import fetch from "node-fetch";
import logger from "../logger.js";
import Media from "./media.js";

class MangaDexAPI {
    url = "https://api.mangadex.org/manga";

    options(vars, method = "POST") {
        let opts = {
            method: method,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        };
        if (vars) {
            opts = {
                ...opts,
                body: JSON.stringify(vars),
            };
        }
        return opts;
    }

    async search(search_query) {
        let data = null;
        await fetch(this.url + "?title=" + search_query, this.options(null, "GET"))
            .then(MangaDexAPI.handleResponse)
            .then((d) => {
                if (d.total > 0) {
                    data = d.data[0];
                    console.log(`[MangaUpdates Search] ✔️ '${search_query}' Sucess.`);
                } else console.log(`[MangaUpdates Search] ❗  '${search_query}' Not Found.`);
            })
            .catch((error) => {
                logger.error(error, `Error while searching MangaUpdates for '${search_query}'. HTTP Response:`);
                console.log(`[MangaUpdates Search] ❌  '${search_query}'. Check Logs.`);
            });
        return data;
    }

    static handleResponse(response) {
        return response.json().then(function (json) {
            return response.ok ? json : Promise.reject(json);
        });
    }
}

export default MangaDexAPI;
