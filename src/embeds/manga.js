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
        let author = data.staff.edges.find((s) => s.role.toLowerCase().includes("story"));
        let format = data.format.replace("_", " ");
        format = format.charAt(0).toUpperCase() + format.slice(1).toLowerCase();
        let embed = new EmbedBuilder()
            .setColor(colors[data.status])
            .setTitle(title)
            .setThumbnail(data.coverImage.extraLarge)
            .addFields(
                { name: "English", value: title_en, inline: true },
                { name: "Native", value: title_nat, inline: true },
                { name: "Format", value: `${format}`, inline: true}
            )
            .setTimestamp()
            .setFooter({ text: "<manga> ]ln[ {anime}" });
        if(data.status == "RELEASING" || data.status == "HIATUS"){
            embed.addFields(
                { name: "Genres", value: genres, inline: true },
                { name: "Status", value: status, inline: true }
            );
        }else {
            embed.addFields({ name: "Genres", value: genres });
            embed.addFields(
                { name: "Status", value: status, inline: true },
                { name: "Chapters", value: `${data.chapters}`, inline: true },
                { name: "Volumes", value: `${data.volumes}`, inline: true }
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
