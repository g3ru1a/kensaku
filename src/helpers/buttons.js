import { ButtonStyle } from "discord.js";
import { ThreadFollow } from "./threadFollow.js";


export const Buttons = {
    async handle(interaction) {
        if (!interaction.isButton()) return;
        let buttonData = JSON.parse(interaction.customId);
        if (buttonData[0] === "force_delete") {
            try {
                await interaction.message.delete();
            } catch (err) {
                interaction.reply("Something went wrong while trying to delete, try again later.");
                setTimeout(() => interaction.deleteReply(), 5000);
                return;
            }
        }
        if (buttonData[0] === "delete") {
            if (buttonData[1] === interaction.member.id) {
                try{
                    interaction.message.delete();
                }catch(err){
                    interaction.reply({content: "Something went wrong while trying to delete, try again later.", ephemeral: true});
                    setTimeout(() => interaction.deleteReply(), 5000);
                }
            } else {
                interaction.reply({ content: `Looks like you can't use this button!`, ephemeral: true });
                
            }
        }
        if (buttonData[0] === "dm") {
            interaction.member.send({ embeds: interaction.message.embeds, components: [this.dmComponents(interaction.member.id)]});
            interaction.deferUpdate();
        }
        if (buttonData[0] === "toggle") {
            let following = await ThreadFollow.toggleFollow(interaction.member.id, interaction.channel, interaction.guild);
            let status = following ? "are now" : "are no longer"
            interaction.reply({ content: `You ${status} following ${interaction.channel.name}.`, ephemeral: true});
        }
    },
    components: (member_id) => {
        return {
            type: 1,
            components: [
                {
                    type: 2,
                    style: ButtonStyle.Danger,
                    label: "Delete",
                    // Our button id, we can use that later to identify,
                    // that the user has clicked this specific button
                    custom_id: `["delete","${member_id}"]`,
                },
                {
                    type: 2,
                    style: ButtonStyle.Primary,
                    label: "DM me this!",
                    // Our button id, we can use that later to identify,
                    // that the user has clicked this specific button
                    custom_id: `["dm","${member_id}"]`,
                },
            ],
        };
    },
    threadComponents: (member_id) => {
        return {
            type: 1,
            components: [
                {
                    type: 2,
                    style: ButtonStyle.Danger,
                    label: "Delete",
                    // Our button id, we can use that later to identify,
                    // that the user has clicked this specific button
                    custom_id: `["delete","${member_id}"]`,
                },
                {
                    type: 2,
                    style: ButtonStyle.Secondary,
                    label: "Follow/Unfollow Thread",
                    // Our button id, we can use that later to identify,
                    // that the user has clicked this specific button
                    custom_id: `["toggle","${member_id}"]`,
                },
                {
                    type: 2,
                    style: ButtonStyle.Primary,
                    label: "DM me this!",
                    // Our button id, we can use that later to identify,
                    // that the user has clicked this specific button
                    custom_id: `["dm","${member_id}"]`,
                },
            ],
        };
    },
    dmComponents: (member_id) => {
        return {
            type: 1,
            components: [
                {
                    type: 2,
                    style: ButtonStyle.Danger,
                    label: "Delete",
                    // Our button id, we can use that later to identify,
                    // that the user has clicked this specific button
                    custom_id: `["force_delete","${member_id}"]`,
                },
            ],
        };
    },
};