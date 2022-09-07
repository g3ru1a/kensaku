import { SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder } from "discord.js";
import MangaEmbed from "../embeds/manga.js";
import AnilistAPI from "../helpers/anilist.js";
import MangaUpdatesAPI from "../helpers/mangaupdates.js";
import Media from "../helpers/media.js";

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
        interaction.channel.sendTyping();
        let data = await ALApi.search(search_query);
        let mu_url = await MUApi.findUrlByTitle(search_query);

        if (!data) interaction.reply("Could not find anything.");

        data.mu_url = mu_url;
        let embed = MangaEmbed.build(data, detailed);
        await interaction.channel.send({ embeds: [embed] });
    },
    async fetchMangaExperimental(interaction, search_query, detailed = false) {
        interaction.channel.sendTyping();
        let data = await MUApi.search(search_query);

        // Not found
        if (!data) {
            interaction.reply("Could not find anything.");
            return;
        }
        // Only one found
        if (data instanceof Media) {
            let embed = MangaEmbed.build(data, detailed);
            await interaction.channel.send({ embeds: [embed] });
            return;
        }

        // Found Multiple
        let smb = new SelectMenuBuilder().setCustomId("select_manga").setPlaceholder("Nothing selected");

        data.forEach((e) => {
            smb.addOptions({
                label: e.name,
                value: JSON.stringify([e.id, detailed, interaction.member.id]),
            });
        });

        const row = new ActionRowBuilder().addComponents(smb);
        await interaction.reply({ content: "Which Series are you looking for?", components: [row] });
    },
    async loadManga(interaction, series_id, detailed = false) {
        let data = new Media();
        let series = await MUApi.getSeries(series_id);
        await data.loadFromMUResult(series);

        let embed = MangaEmbed.build(data, detailed);
        await interaction.channel.send({ embeds: [embed] });
    },
};
