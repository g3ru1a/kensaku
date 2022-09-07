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
            interaction.options.getBoolean("detailed"),
            true
        );
    },
    async fetchLightNovel(interaction, search_query, detailed = false, cmd = false) {
        let data = await ALApi.search(search_query);
        let results = await MUApi.search(data.title.romaji, { type: ["Novel"] });
        let mu_url = null;
        if (results) mu_url = await MUApi.getSeries(results[0].id);
        if (mu_url) mu_url = mu_url.mu_url;

        if (!data) {
            interaction.reply("Could not find anything.");
            return;
        }

        data.mu_url = mu_url;
        let embed = LNEmbed.build(data, detailed);
        if (cmd) await interaction.reply({ embeds: [embed] });
        else await interaction.channel.send({ embeds: [embed] });
    },
};
