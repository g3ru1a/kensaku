import dotenv from "dotenv";
import { Client, GatewayIntentBits, ActivityType } from "discord.js";
import CH from "./helpers/commands.js";
//Load .env
dotenv.config();

const token = process.env.BOT_TOKEN;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = await CH.loadCommandCollectionFrom("commands");

// When the client is ready, run this code (only once)
client.once("ready", () => {
    console.log("Up and Running!");
    client.user.setActivity("manga unboxings", { type: ActivityType.Watching });
    client.user.setStatus('dnd');
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }
});

client.on("messageCreate", async(message) => {
    if (message.author.bot) return;
    
    let anime = message.content.match(/\{(.*?)\}/g);
    if (anime) {
        let name = anime[0].replace(/[{}]/g, "");
        const command = message.client.commands.get("ka");
        command.fetchAnime(message, name, (message.content.match(/\{\{(.*?)\}\}/g) != null));
        return;
    }

    let manga = message.content.match(/\<(.*?)\>/g);
    if (manga && message.content.match(/\<(.*?)\d{4,}\>/g) == null) {
        let name = manga[0].replace(/[<>]/g, "");
        const command = message.client.commands.get("km");
        command.fetchManga(message, name, message.content.match(/\<\<(.*?)\>\>/g) != null);
        return;
    }

    let ln = message.content.match(/\](.*?)\[/g);
    if (ln) {
        let name = ln[0].replace(/[\[\]]/g, "");
        const command = message.client.commands.get("kl");
        command.fetchLightNovel(message, name, message.content.match(/\]\](.*?)\[\[/g) != null);
        return;
    }
});

// Login to Discord with your client's token
client.login(token);
