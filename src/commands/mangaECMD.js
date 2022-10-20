import { SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder } from "discord.js";
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
        .setName("kme")
        .setDescription("Searches for Manga!")
        .addStringOption((option) => option.setName("name").setDescription("Terms to lookup").setRequired(true))
        .addBooleanOption((option) => option.setName("detailed").setDescription("Show Full Info")),
    async execute(interaction) {
        this.fetchMangaExperimental(
            interaction,
            interaction.options.getString("name"),
            interaction.options.getBoolean("detailed"),
            true
        );
    },
    async fetchMangaExperimental(interaction, search_query, detailed = false) {
        interaction.channel.sendTyping();
        let data = await MUApi.search(search_query);
        // Not found
        if (!data) {
            interaction.reply({ content: "Could not find anything.", ephemeral: true});
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
        await interaction.reply({ content: "Which Series are you looking for?", components: [row], ephemeral: true });
    },
    async loadManga(interaction, series_id, detailed = false) {
        interaction.channel.sendTyping();
        let mu = await MUApi.getSeries(series_id);
        if (!mu) return;

        let [al, md] = await Promise.allSettled([ALApi.search(mu.title.romaji), MDApi.search(mu.title.romaji)]);

        let data = { ...mu };
        if (al) {
            al = al.value;
            if (al) {
                let keys = Object.keys(data).filter(
                    (key) => data[key] == "" || data[key] == undefined || data[key] == null
                );
                keys.forEach((key) => {
                    if (al[key]) data[key] = al[key];
                });
                if (al.status && al.status.length < data.status.length) data.status = al.status.toUpperCase();
                if (al.author && al.author.length > data.author.length) data.author = al.author;
                if (data.title.romaji == null && al.title?.romaji) {
                    data.title.romaji = al.title.romaji;
                }
                if (data.title.native == null && al.title?.native) {
                    data.title.native = al.title.native;
                }
                if (data.title.english == null && al.title?.english) {
                    data.title.english = al.title.english;
                }
            }
        }
        if (md) {
            md = md.value;
            if (md) {
                let keys = Object.keys(data).filter(
                    (key) => data[key] == "" || data[key] == undefined || data[key] == null
                );
                keys.forEach((key) => {
                    if (md[key]) data[key] = md[key];
                });
                if (md.status && md.status.length < data.status.length) data.status = md.status.toUpperCase();
                if (md.author && md.author.length > data.author.length) data.author = md.author;
                if (data.title.romaji == null && md.title?.romaji) {
                    data.title.romaji = md.title.romaji;
                }
                if (data.title.native == null && md.title?.native) {
                    data.title.native = md.title.native;
                }
                if (data.title.english == null && md.title?.english) {
                    data.title.english = md.title.english;
                }
            }
        }
        let embed = MangaEmbed.build(data, detailed);

        let comp = interaction.channel.isThread()
            ? Buttons.threadComponents(interaction.member.id)
            : Buttons.components(interaction.member.id);

        await interaction.channel.send({ embeds: [embed], components: [comp] });
        if (interaction.channel.isThread()) ThreadFollow.pushToFollowers(interaction, embed);
    },
};
