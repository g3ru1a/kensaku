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
        let genres = data.genres.join(', ');
        let al_link = `https://anilist.co/manga/${data.id}`;
        let mal_link = `https://myanimelist.net/manga/${data.idMal}`;
        let links = `[AL](${al_link}), [MAL](${mal_link})`;
        if (data.mu_url) links += `, [MU](${data.mu_url})`;
        let author = data.staff.edges.find((s) => s.role.toLowerCase().includes("story"));
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
            .setTimestamp()
            .setFooter({ text: "<manga> ]ln[ {anime}" });
        if(data.status == "RELEASING" || data.status == "HIATUS"){
            // embed.addFields({ name: "\u200B", value: "\u200B", inline: true });
            embed.addFields(
                {
                    name: "\u200b",
                    value: `**Genres:** ${genres} | **Status:** ${status}`,
                },
            );
        }else {
            embed.addFields(
                {
                    name: "\u200b",
                    value: `**Genres:** ${genres} | **Status:** ${status} | **Chapters:** ${data.chapters} | **Volumes:** ${data.volumes}`,
                },
            );
        }
        if(detailed) {
            let description = data.description.replace(/<\/?[^>]+(>|$)/g, "");
            embed.setDescription(links + '\n' + description);
        }else embed.setDescription(links);

        if(author) {
            embed.setAuthor({ name: `Written By ${author.node.name.full}` });
        }

        return embed;
    },
};
