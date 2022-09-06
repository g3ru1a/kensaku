const { EmbedBuilder } = require("discord.js");

const colors = {
    RELEASING: "#036bfc",
    FINISHED: "#03fc88",
    CANCELLED: "#fc3503",
    HIATUS: "#fcba03",
    NOT_YET_RELEASED: "#03f8fc",
};

module.exports = {
    build: function (data, detailed = false) {
        let title = data.title.romaji;
        let title_en = data.title.english ? data.title.english : "N/A";
        let title_nat = data.title.native ? data.title.native : "N/A";
        let status = data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase();
        let genres = "";
        data.genres.forEach((element) => {
            genres += element + ', ';
        });
        let al_link = `https://anilist.co/anime/${data.id}`;
        let mal_link = `https://myanimelist.net/anime/${data.idMal}`;
        let links = `[AL](${al_link}), [MAL](${mal_link})`;
        let embed = new EmbedBuilder()
            .setColor(colors[data.status])
            .setTitle(title)
            .setThumbnail(data.coverImage.extraLarge)
            .addFields(
                {
                    name: "\u200b",
                    value: `**English:** ${title_en} | **Native:** ${title_nat}`,
                }
            )
            .addFields(
                {
                    name: "\u200b",
                    value: `**Genres:** ${genres} | **Status:** ${status} | **Episodes:** ${data.episodes}`,
                },
            )
            .setTimestamp()
            .setFooter({ text: "<manga> ]ln[ {anime}" });
        if (detailed) {
            let description = data.description.replace(/<\/?[^>]+(>|$)/g, "");
            embed.setDescription(links + "\n" + description);
        } else embed.setDescription(links);

        if (data.nextAiringEpisode) {
            let seconds = data.nextAiringEpisode.timeUntilAiring;
            let numdays = Math.floor((seconds % 31536000) / 86400);
            let numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
            let time = "";
            if (numdays > 0) time += `${numdays} days `; 
            if (numhours > 0) time += `${numhours} hours`;  
            embed.addFields({
                name: "\u200B",
                value: `**Episode #${data.nextAiringEpisode.episode}** in ${time}`,
            });
        }

        return embed;
    },
};
