import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Buttons } from "./buttons.js";

let data = {};
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filePath = "../../follower.json";
const realPath = path.join(__dirname, filePath);

export const ThreadFollow = {
    boot: () => {
        if (!fs.existsSync(realPath)) {
            fs.writeFileSync(realPath, JSON.stringify({ channels: [] }));
        }
        let buf = fs.readFileSync(realPath);
        data = JSON.parse(buf.toString());
        console.log("[ThreadFollowing] Loaded Followers File.");
    },
    toggleFollow: (member_id, channel) => {
        let channel_id = channel.id;
        let onList = true;
        //If theres already members in the channel follow list
        if(data.channels.find(c => c.id === channel_id)){
            //check if the member is already following, if so, remove them from the list
            if (data.channels.find((c) => c.id === channel_id).members.find((m) => m === member_id)){
                data.channels.find((c) => c.id === channel_id).members = data.channels
                    .find((c) => c.id === channel_id)
                    .members.filter((m) => m !== member_id);    
                onList = false;
            //if not then add them
            }else {
                data.channels.find((c) => c.id === channel_id).members.push(member_id);
            }
        // If nobody followes the channel, initialize it with the member
        }else{
            data.channels = [
                ...data.channels,
                {
                    id: channel_id,
                    name: channel.name,
                    members: [member_id]
                }
            ];
        }
        //Save data
        let toBeWritten = JSON.stringify(data);
        fs.writeFileSync(realPath, toBeWritten);
        let logData = onList ? 'started':'stopped'
        console.log(`[ThreadFollowing] User(${member_id}) ${logData} following #${channel.name}(${channel.id}).`);
        return onList;
    },
    pushToFollowers: (interaction, embed) => {
        let channel_id = interaction.channel.id;
        if(!data.channels.find(c => c.id === channel_id)) return;

        let members = data.channels.find(c => c.id === channel_id).members;
        members.forEach(member => {
            // if(member === interaction.member.id) return;
            interaction.client.users.cache.get(member).send({
                content: `> Recommendation from <#${interaction.channel.id}>\n > Sent by <@${interaction.member.id}> \n\n *To unfollow a thread go to said thread and click the 'Follow/Unfollow Thread' button on any of the bot messages.*`,
                embeds: [embed],
                components: [Buttons.dmComponents(member)],
            });
        });
        console.log("[ThreadFollowing] Sent to " + members.length + " users.");
    },
};
