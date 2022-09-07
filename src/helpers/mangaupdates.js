import fetch from "node-fetch";
import logger from "../logger.js";
import API from "./api.js";
import Media from "./media.js";

class MangaUpdatesAPI extends API {
    url = "https://api.mangaupdates.com/v1/series/";

    async search(search_query, opts) {
        let data = null;
        let opt = this.constructor.options({
            search: search_query,
            stype: "title",
            type: ["Manga", "Manhua", "Manhwa", "French"],
            ...opts,
        });

        await fetch(this.url + "search", opt)
            .then(this.constructor.handleResponse)
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
        let results = [];
        data.results.slice(0, Math.min(data.results.length, 5)).forEach((res) => {
            results.push({ name: res.record.title, id: res.record.series_id });
        });
        return results;
    }

    async getSeries(series_id) {
        let data = null;
        let opts = this.constructor.options(null, "GET");
        await fetch(this.url + series_id, opts)
            .then(this.constructor.handleResponse)
            .then((d) => {
                data = d;
            })
            .catch((error) => console.log(error));
        return this.constructor.parseToMedia(data);
    }

    static parseToMedia(data) {
        let media = new Media();
        media.mu_url = data.url;
        media.title.romaji = data.title;
        media.description = data.description?.replace(/<\/?[^>]+(>|$)/g, "");
        media.status = data.status;
        media.chapters = data.latest_chapter;
        media.volumes = null;
        media.genres = data.genres.map(g => g.genre).join(", ");
        media.format = data.type;
        media.image_url = data.image.url.original;
        media.author = data.authors.filter(a => a.type == "Author").map(a => a.name).join(" & ");
        return media;
    }
}

export default MangaUpdatesAPI;
