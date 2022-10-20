import { SlashCommandBuilder } from "discord.js";
import AnimeEmbed from "../embeds/anime.js";
import AnilistAPI from "../helpers/anilist.js";
import { Buttons } from "../helpers/buttons.js";
import { ThreadFollow } from "../helpers/threadFollow.js";

const ALApi = new AnilistAPI(AnilistAPI.Types.ANIME);

export default {
    data: new SlashCommandBuilder()
        .setName("ka")
        .setDescription("Searches for Anime!")
        .addStringOption((option) => option.setName("name").setDescription("Terms to lookup").setRequired(true))
        .addBooleanOption((option) => option.setName("detailed").setDescription("Show Full Info")),
    async execute(interaction) {
        this.fetchAnime(interaction, interaction.options.getString("name"), interaction.options.getBoolean("detailed"), true);
    },
    async fetchAnime(interaction, search_query, detailed = false, cmd = false) {
        interaction.channel.sendTyping();
        let data = await ALApi.search(search_query);
        
        if (!data) {
            interaction.reply("Could not find anything.").then((msg) => {
                setTimeout(() => msg.delete(), 3000);
            });
            return;
        }

        let embed = AnimeEmbed.build(data, detailed);

        let comp = interaction.channel.isThread()
            ? Buttons.threadComponents(interaction.member.id)
            : Buttons.components(interaction.member.id);

        if (cmd) await interaction.reply({ embeds: [embed], components: [comp] });
        else await interaction.channel.send({ embeds: [embed], components: [comp] });

        if (interaction.channel.isThread()) ThreadFollow.pushToFollowers(interaction, embed);
    },
};
