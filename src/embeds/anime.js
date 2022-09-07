import { EmbedBuilder } from "discord.js";
import MediaEmbed from "./mediaEmbed.js";

export default {
    /**
     * 
     * @param {Media} data 
     * @param {boolean} detailed 
     * @returns EmbedBuilder
     */
    build: function (data, detailed = false) {
        let status = data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase();
        let links = MediaEmbed.getLinks(data);

        let embed = MediaEmbed.get(data);
        
        embed.addFields({ 
            name: "\u200b",value: `**Genres:** ${data.genres} | **Status:** ${status} | **Episodes:** ${data.episodes}`});
        
        let desc = links;
        if (detailed) desc += "\n" + data.description;
        embed.setDescription(desc);

        if (data.nextAiringEpisode) { 
            embed.addFields({
                name: "\u200B",
                value: `**Episode #${data.nextEpisode.episode}** in ${MediaEmbed.getNextEpisodeTime(data)}`,
            });
        }

        return embed;
    },
};
