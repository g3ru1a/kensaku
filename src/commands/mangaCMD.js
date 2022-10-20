import { SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle } from "discord.js";
import MangaEmbed from "../embeds/manga.js";
import AnilistAPI from "../helpers/anilist.js";
import { Buttons } from "../helpers/buttons.js";
import MangaDexAPI from "../helpers/mangadex.js";
import MangaUpdatesAPI from "../helpers/mangaupdates.js";
import Media from "../helpers/media.js";
import { ThreadFollow } from "../helpers/threadFollow.js";

const ALApi = new AnilistAPI(AnilistAPI.Types.MANGA);
const MUApi = new MangaUpdatesAPI();
const MDApi = new MangaDexAPI();

export default {
    data: new SlashCommandBuilder()
        .setName("km")
        .setDescription("Searches for Manga!")
        .addStringOption((option) => option.setName("name").setDescription("Terms to lookup").setRequired(true))
        .addBooleanOption((option) => option.setName("detailed").setDescription("Show Full Info")),
    async execute(interaction) {
        this.fetchManga(interaction, interaction.options.getString("name"), interaction.options.getBoolean("detailed"), true);
    },
    async fetchManga(interaction, search_query, detailed = false, cmd = false) {
        interaction.channel.sendTyping();
        let data = await ALApi.search(search_query);
        let results = await MUApi.search(search_query);
        let mu_url = null;
        if(results) mu_url = await MUApi.getSeries(results[0].id);
        if(mu_url) mu_url = mu_url.mu_url;

        if (!data) {
            interaction.reply({ content: "Could not find anything.", ephemeral: true}).then((msg) => {
                setTimeout(() => msg.delete(), 3000);
            });
            return;
        }

        data.mu_url = mu_url;
        let embed = MangaEmbed.build(data, detailed);

        let comp = interaction.channel.isThread() ? Buttons.threadComponents(interaction.member.id) : Buttons.components(interaction.member.id);
        
        if(cmd) await interaction.reply({
            embeds: [embed],
            components: [comp],
        });
        else await interaction.channel.send({ embeds: [embed], components: [comp] });

        if(interaction.channel.isThread()) ThreadFollow.pushToFollowers(interaction, embed);
    },
};
