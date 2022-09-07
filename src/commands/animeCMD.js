import { SlashCommandBuilder } from "discord.js";
import AnimeEmbed from "../embeds/anime.js";
import AnilistAPI from "../helpers/anilist.js";

const ALApi = new AnilistAPI(AnilistAPI.Types.ANIME);

export default {
    data: new SlashCommandBuilder()
        .setName("ka")
        .setDescription("Searches for Anime!")
        .addStringOption((option) => option.setName("name").setDescription("Terms to lookup").setRequired(true))
        .addBooleanOption((option) => option.setName("detailed").setDescription("Show Full Info")),
    async execute(interaction) {
        this.fetchAnime(interaction, interaction.options.getString("name"), interaction.options.getBoolean("detailed"));
    },
    async fetchAnime(interaction, search_query, detailed = false) {
        let data = await ALApi.search(search_query);
        
        if (!data) {
            interaction.reply("Could not find anything.");
            return;
        }

        let embed = AnimeEmbed.build(data, detailed);
        await interaction.reply({ embeds: [embed] });
    },
};
