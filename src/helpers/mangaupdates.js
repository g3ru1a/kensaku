import fetch from "node-fetch";
import logger from "../logger.js";

class MangaUpdatesAPI {
    url = "https://api.mangaupdates.com/v1/series/search";

    options(vars) {
        return {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(vars),
        };
    }

    async findUrlByTitle(search_query, opts){
        let link;
        let opt = this.options({
            search: search_query,
            stype: "title",
            ...opts
        });
        await fetch(this.url, opt)
        .then(MangaUpdatesAPI.handleResponse)
        .then((data) => {
            if (data.total_hits > 0) {
                let res = data.results[0];
                link = res.record.url;
                console.log(`[MangaUpdates Search] ✔️ '${search_query}' Sucess.`);
            }else console.log(`[MangaUpdates Search] ❗  '${search_query}' Not Found.`);
        })
        .catch((error) => {
            logger.error(error, `Error while searching MangaUpdates for '${search_query}'. HTTP Response:`);
            console.log(`[MangaUpdates Search] ❌  '${search_query}'. Check Logs.`);
        });
        return link;
    }

    static handleResponse(response){
        return response.json().then(function (json) {
            return response.ok ? json : Promise.reject(json);
        });
    }
}

export default MangaUpdatesAPI;
