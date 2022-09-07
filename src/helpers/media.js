
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

    loadFromALData(data) {
        this.al_url = `https://anilist.co/manga/${data.id}`;
        this.mal_url = `https://myanimelist.net/manga/${data.idMal}`;
        this.title = { ...data.title };
        this.description = data.description.replace(/<\/?[^>]+(>|$)/g, "");
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
}

export default Media;