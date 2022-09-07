import MediaEmbed from "./mediaEmbed.js";

export default {
    build: function (data, detailed = false) {
        let status = data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase();
        let links = MediaEmbed.getLinks(data);

        let embed = MediaEmbed.get(data);

        if(data.status == "RELEASING" || data.status == "HIATUS"){
            embed.addFields({name: "\u200b",value: `**Genres:** ${data.genres} | **Status:** ${status}`});
        }else {
            embed.addFields({name: "\u200b",value: `**Genres:** ${data.genres} | **Status:** ${status} | **Chapters:** ${data.chapters} | **Volumes:** ${data.volumes}`});
        }

        let desc = links;
        if (detailed) desc += "\n" + data.description;
        embed.setDescription(desc);

        return embed;
    },
};
