import dotenv from "dotenv";
import { Routes } from "discord.js";
import { REST } from "@discordjs/rest";
import CH from "./helpers/commands.js";

dotenv.config();

const clientId = process.env.CLIENT_ID;
const token = process.env.BOT_TOKEN;

const commands = await CH.loadCommandArrayFrom("commands");

const rest = new REST({ version: "10" }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: [] })
    .then(() => console.log("Successfully deleted all commands."))
    .catch(console.error);

rest.put(Routes.applicationCommands(clientId), { body: commands })
    .then((data) => console.log(`Successfully registered ${data.length} application commands.`))
    .catch(console.error);