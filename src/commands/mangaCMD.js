import { SlashCommandBuilder } from "discord.js";
import MangaEmbed from "../embeds/manga.js";
import AnilistAPI from "../helpers/anilist.js";
import MangaUpdatesAPI from "../helpers/mangaupdates.js";

const ALApi = new AnilistAPI(AnilistAPI.Types.MANGA);
const MUApi = new MangaUpdatesAPI();

export default {
    data: new SlashCommandBuilder()
        .setName("km")
        .setDescription("Searches for Manga!")
        .addStringOption((option) => option.setName("name").setDescription("Terms to lookup").setRequired(true))
        .addBooleanOption((option) => option.setName("detailed").setDescription("Show Full Info")),
    async execute(interaction) {
        this.fetchManga(interaction, interaction.options.getString("name"), interaction.options.getBoolean("detailed"));
    },
    async fetchManga(interaction, search_query, detailed = false) {
        let data = await ALApi.search(search_query);
        let mu_url = await MUApi.findUrlByTitle(search_query);

        if (!data) interaction.reply("Could not find anything.");

        data.mu_url = mu_url;
        let embed = MangaEmbed.build(data, detailed);
        await interaction.reply({ embeds: [embed] });
    },
};
