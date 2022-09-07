import { SlashCommandBuilder } from "discord.js";
import LNEmbed from "../embeds/lightnovel.js";
import AnilistAPI from "../helpers/anilist.js";
import MangaUpdatesAPI from "../helpers/mangaupdates.js";

const ALApi = new AnilistAPI(AnilistAPI.Types.MANGA, AnilistAPI.Sorts.POPULARITY_DESC,
    false, AnilistAPI.Formats.NOVEL);
const MUApi = new MangaUpdatesAPI();

export default {
    data: new SlashCommandBuilder()
        .setName("kl")
        .setDescription("Searches for Light Novels!")
        .addStringOption((option) => option.setName("name").setDescription("Terms to lookup").setRequired(true))
        .addBooleanOption((option) => option.setName("detailed").setDescription("Show Full Info")),
    async execute(interaction) {
        this.fetchLightNovel(
            interaction,
            interaction.options.getString("name"),
            interaction.options.getBoolean("detailed")
        );
    },
    async fetchLightNovel(interaction, search_query, detailed = false) {
        let data = await ALApi.search(search_query);
        let mu_url = await MUApi.findUrlByTitle(data.title.romaji, { type: ["Novel"] });

        if (!data) {
            interaction.reply("Could not find anything.");
            return;
        }

        data.mu_url = mu_url;
        let embed = LNEmbed.build(data, detailed);
        await interaction.reply({ embeds: [embed] });
    },
};
