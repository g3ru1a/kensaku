import { SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle } from "discord.js";
import MangaEmbed from "../embeds/manga.js";
import { Buttons } from "../helpers/buttons.js";
import Media from "../helpers/media.js";
import { ThreadFollow } from "../helpers/threadFollow.js";


export default {
    data: new SlashCommandBuilder()
        .setName("kinvite")
        .setDescription("DM's you an invite link for the bot!"),
    async execute(interaction) {
        interaction.member.send({content: "Use the following link to add me to your server: https://discord.com/oauth2/authorize?client_id=1016677293789298729&scope=bot&permissions=414464724032"});
        interaction.reply({content: "DM'd the link to you.", ephemeral: true});
    },
};
