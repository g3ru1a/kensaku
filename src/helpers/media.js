import AnilistAPI from "../helpers/anilist.js";
import MangaDexAPI from "../helpers/mangadex.js";

class Media {
    al_url = "";
    mal_url = "";
    mu_url = "";
    md_url = "";
    title = {
        romaji: null,
        english: null,
        native: null,
    };
    description = "";
    status = "";
    chapters = 0;
    volumes = 0;
    genres = "";
    format = "";
    episodes = "";
    image_url = "";
    author = undefined;
    nextEpisode = {
        timeUntil: 0,
        episode: "",
    };
    ALApi = new AnilistAPI(AnilistAPI.Types.MANGA);
    MDApi = new MangaDexAPI();

    loadFromALData(data) {
        this.al_url = `https://anilist.co/manga/${data.id}`;
        this.mal_url = `https://myanimelist.net/manga/${data.idMal}`;
        this.title = { ...data.title };
        this.description = data.description?.replace(/<\/?[^>]+(>|$)/g, "");
        this.status = data.status;
        this.chapters = data.chapters;
        this.volumes = data.volumes;
        this.genres = data.genres.join(", ");
        this.format = data.format;
        this.episodes = data.episodes;
        this.image_url = data.coverImage.extraLarge;

        let a = data.staff.edges.find((s) => s.role.toLowerCase().includes("story"));
        if (a) this.author = a.node.name.full;

        this.nextEpisode = {
            timeUntil: data.nextAiringEpisode?.timeUntilAiring,
            episode: data.nextAiringEpisode?.episode,
        };
    }

    async loadFromMUResult(result) {
        let al_data = await this.ALApi.search(result.title);
        let md_data = await this.MDApi.search(result.title);
        let mu_data = result;

        this.al_url = al_data && al_data.al_url ? al_data.al_url : "";
        this.mal_url = al_data && al_data.mal_url ? al_data.mal_url : "";
        this.mu_url = result.url;
        this.md_url = md_data ? `https://mangadex.org/title/${md_data.id}` : "";
        this.author = result.authors.filter((a) => a.type.includes("Author")).map(a => a.name).join(" & ");
        this.description = this.computeDescription(mu_data, al_data, md_data);
        this.title = this.computeTitle(mu_data, al_data, md_data);
        this.chapters = this.computeChapter(mu_data, al_data, md_data);
        this.volumes = this.computeVolumes(mu_data, al_data, md_data);
        this.status = this.computeStatus(mu_data, al_data, md_data);
        this.image_url = this.computeImage(mu_data, al_data, md_data);
        this.format = result.type;
        this.genres = result.genres?.map((g) => g.genre).join(", ");
    }

    computeDescription(mu, al, md) {
        if(mu.description) return mu.description.replace(/<\/?[^>]+(>|$)/g, "");
        else if(al && al.description) return al.description;
        else if(md && md.attributes.description?.en)
            return md.attributes.description.en.replace(/<\/?[^>]+(>|$)/g, "");
        else return "";
    }

    computeTitle(mu, al, md) {
        let titles = al
            ? al.title
            : {
                  romaji: null,
                  english: null,
                  native: null,
              };
        if(titles.romaji == null) {
            titles.romaji = mu.title;
        }
        if (titles.english == null && md) {
            let title = md.attributes.altTitles.find(a => a.en != undefined);
            titles.english = title ? title.en : null;
        }
        if (titles.native == null && md) {
            let titleObj = md.attributes.altTitles[0];
            let key = Object.keys(titleObj)[0];
            titles.native = titleObj[key];
        }
        return titles;
    }
    computeChapter(mu, al, md) {
        if(al && al.chapters) return al.chapters;
        else if(mu.latest_chapter) return mu.latest_chapter;
        else if (md && md.attributes.lastChapter) return md.attributes.lastChapter;
        else return "N/A";
    }
    computeVolumes(mu, al, md) {
        if (al && al.volumes) return al.volumes;
        else if (md && md.attributes.lastVolume) return md.attributes.lastVolume;
        else return "N/A";
    }
    computeStatus(mu, al, md) {
        if(al && al.status) return al.status;
        else if(md && md.attributes.status) return md.attributes.status.toUpperCase();
        else return "N/A";
    }
    computeImage(mu, al, md) {
        return mu.image.url.original;
    }
}

export default Media;
