import fetch from "node-fetch";
import logger from "../logger.js";
import API from "./api.js";
import Media from "./media.js";

class MangaDexAPI extends API {
    url = "https://api.mangadex.org/manga";

    async search(search_query) {
        let data = null;
        let opts = this.constructor.options(null, "GET");
        await fetch(this.url + "?title=" + search_query, opts)
            .then(this.constructor.handleResponse)
            .then((d) => {
                if (d.total > 0) {
                    data = d.data[0];
                    console.log(`[MangaDex Search] ✔️ '${search_query}' Sucess.`);
                } else console.log(`[MangaDex Search] ❗  '${search_query}' Not Found.`);
            })
            .catch((error) => {
                logger.error(error, `Error while searching MangaDex for '${search_query}'. HTTP Response:`);
                console.log(`[MangaDex Search] ❌  '${search_query}'. Check Logs.`);
            });
        if(data == null) return null;
        return this.constructor.parseToMedia(data);
    }

    static parseToMedia(data) {
        let attr = data.attributes;
        let media = new Media();
        media.md_url = `https://mangadex.org/title/${data.id}`;

        media.title.native = attr.altTitles[attr.originalLanguage];
        media.title.english = attr.altTitles?.en;
        media.genres = null

        media.description = attr.description?.en?.replace(/<\/?[^>]+(>|$)/g, "");
        media.status = attr.status?.toUpperCase();
        media.chapters = attr.lastChapter;
        media.volumes = attr.lastVolume;
        media.format = data.type;
        media.image_url = null;
        media.author = null;
        return media;
    }
}

export default MangaDexAPI;
