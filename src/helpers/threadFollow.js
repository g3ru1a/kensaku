import { Buttons } from "./buttons.js";
import mongoose from "mongoose";
import {Channel} from "./DB/channel.js";
import {Member} from "./DB/member.js";
import {ChannelMember} from "./DB/channel_member.js";

export const ThreadFollow = {
    boot: async () => {
        return mongoose
            .connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => console.log("[ThreadFollowing] Connected to DB."))
            .catch((err) => console.log(err));
    },
    toggleFollow: async (member_id, channel, guild) => {
        let onList = true;
        //If channel or member are not registered, register them in DB
        let member = await Member.findOne({discord_id: member_id}).exec();
        if (member === null) {
            member = await new Member({ discord_id: member_id, guild_id: guild.id}).save();
        }
        let ch = await Channel.findOne({ discord_id: channel.id }).exec();
        if (ch === null) {
            ch = await new Channel({ discord_id: channel.id, discord_name: channel.name }).save();
        }

        let cm = await ChannelMember.findOne({channel: ch, member: member}).exec();
        if(cm === null){
            await new ChannelMember({channel: ch, member: member}).save();
        }else{
            await ChannelMember.findByIdAndRemove(cm);
            onList = false;
        }
        let logData = onList ? 'started':'stopped'
        console.log(`[ThreadFollowing] User(${member_id}) ${logData} following #${channel.name}(${channel.id}).`);
        return onList;
    },
    pushToFollowers: async (interaction, embed) => {
        let channel_id = interaction.channel.id;
        let ch = await Channel.findOne({ discord_id: channel_id }).exec();
        if (ch === null) return;
        let cm = await ChannelMember.find({ channel: ch }).populate("member");
        let members = cm.map(channel => channel.member);
        members.forEach(async member => {
            // if(member === interaction.member.id) return;
            let guild = await interaction.client.guilds.fetch(member.guild_id);
            if(!guild) return console.log(`[ThreadFollowing] Could not find Guild(${member.guild_id}) in Client`);
            let user = await guild.members.fetch(member.discord_id);
            if (!user) return console.log(`[ThreadFollowing] Could not find User(${member.discord_id}) in Guild(${guild.id})`);
            user.send({
                content: `> Recommendation from <#${interaction.channel.id}>\n > Sent by <@${interaction.member.id}> \n\n *To unfollow a thread go to said thread and click the 'Follow/Unfollow Thread' button on any of the bot messages.*`,
                embeds: [embed],
                components: [Buttons.dmComponents(member.discord_id)],
            });
        });
        console.log("[ThreadFollowing] Sent to " + members.length + " users.");
    },
};
