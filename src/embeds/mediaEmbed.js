import { EmbedBuilder } from "discord.js";

const colors = {
    RELEASING: "#036bfc",
    FINISHED: "#03fc88",
    CANCELLED: "#fc3503",
    HIATUS: "#fcba03",
    NOT_YET_RELEASED: "#03f8fc",
};

export default {
    get(data){
        let title = data.title.romaji;
        let title_en = data.title.english ? data.title.english : "N/A";
        let title_nat = data.title.native ? data.title.native : "N/A";
        let format = data.format.replace("_", " ");
        if(format != "OVA") format = format.charAt(0).toUpperCase() + format.slice(1).toLowerCase();

        let embed = new EmbedBuilder()
            .setColor(colors[data.status])
            .setTitle(title)
            .setThumbnail(data.image_url)
            .addFields(
                { name: '\u200b', value: `**English:** ${title_en} | **Native:** ${title_nat} | **Format:** ${format}`},
            )

            .setTimestamp()
            .setFooter({ text: "<manga> ]ln[ {anime} | @g3ru1a for bug reports" });
        if (data.author) {
            embed.setAuthor({ name: `Written By ${data.author}` });
        }
        return embed;
    },
    getLinks(data){
        let links = [];
        if (data.al_url && data.al_url != "") links.push(`[AL](${data.al_url})`);
        if (data.mal_url && data.mal_url != "") links.push(`[MAL](${data.mal_url})`);
        if (data.mu_url && data.mu_url != "") links.push(`[MU](${data.mu_url})`);
        if (data.md_url && data.md_url != "") links.push(`[MD](${data.md_url})`);
        return links.join(', ');
    },
    getNextEpisodeTime(data){
        let seconds = data.nextEpisode.timeUntil;
        let numdays = Math.floor((seconds % 31536000) / 86400);
        let numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
        let time = "";
        if (numdays > 0) time += `${numdays} days `;
        if (numhours > 0) time += `${numhours} hours`; 
        return time;
    }
}