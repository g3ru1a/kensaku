import fetch from "node-fetch";
import logger from "../logger.js";
import Media from "./media.js";

class MangaUpdatesAPI {
    url = "https://api.mangaupdates.com/v1/series/search";
    url_get = "https://api.mangaupdates.com/v1/series/";

    options(vars, method = "POST") {
        let opts = {
            method: method,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            }
        };
        if(vars){
            opts = {
                ...opts,
                body: JSON.stringify(vars),
            };
        }
        return opts;
    }

    async findUrlByTitle(search_query, opts) {
        let link;
        let opt = this.options({
            search: search_query,
            stype: "title",
            ...opts,
        });
        await fetch(this.url, opt)
            .then(MangaUpdatesAPI.handleResponse)
            .then((data) => {
                if (data.total_hits > 0) {
                    let res = data.results[0];
                    link = res.record.url;
                    console.log(`[MangaUpdates Search] ✔️ '${search_query}' Sucess.`);
                } else console.log(`[MangaUpdates Search] ❗  '${search_query}' Not Found.`);
            })
            .catch((error) => {
                logger.error(error, `Error while searching MangaUpdates for '${search_query}'. HTTP Response:`);
                console.log(`[MangaUpdates Search] ❌  '${search_query}'. Check Logs.`);
            });
        return link;
    }

    async search(search_query, opts) {
        let data = null;
        let opt = this.options({
            search: search_query,
            stype: "title",
            ...opts,
        });
        await fetch(this.url, opt)
            .then(MangaUpdatesAPI.handleResponse)
            .then((d) => {
                if (d.total_hits > 0) {
                    data = d;
                    console.log(`[MangaUpdates Search] ✔️ '${search_query}' Sucess.`);
                } else console.log(`[MangaUpdates Search] ❗  '${search_query}' Not Found.`);
            })
            .catch((error) => {
                logger.error(error, `Error while searching MangaUpdates for '${search_query}'. HTTP Response:`);
                console.log(`[MangaUpdates Search] ❌  '${search_query}'. Check Logs.`);
            });
        if (data == null) return null;

        if(data.total_hits == 1){
            let res = data.results[0];
            let media = new Media();
            let series = await this.getSeries(res.record.series_id);
            await media.loadFromMUResult(series);
            return media;
        }
        
        let results = [];
        data.results.forEach((res) => {
            results.push({name: res.record.title, id: res.record.series_id});
        });
        return results;
    }

    async getSeries(series_id) {
        let series = null;
        await fetch(this.url_get+series_id, this.options(null, "GET")).then(MangaUpdatesAPI.handleResponse)
        .then(data => {
            series = data;
        })
        .catch(error => console.log(error));
        return series;
    }

    static handleResponse(response) {
        return response.json().then(function (json) {
            return response.ok ? json : Promise.reject(json);
        });
    }
}

export default MangaUpdatesAPI;
