import { SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle } from "discord.js";
import MangaEmbed from "../embeds/manga.js";
import { Buttons } from "../helpers/buttons.js";
import Media from "../helpers/media.js";
import { ThreadFollow } from "../helpers/threadFollow.js";


export default {
    data: new SlashCommandBuilder()
        .setName("ksupport")
        .setDescription("DM's you an invite to the bot support server!"),
    async execute(interaction) {
        interaction.member.send({content: "Use the following link to join the support server: https://discord.gg/fN6W7p8WTr"});
        interaction.reply({content: "DM'd the link to you.", ephemeral: true});
    },
};
