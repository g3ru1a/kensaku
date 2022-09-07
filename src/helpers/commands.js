import fs from "node:fs";
import path from "node:path";
import { Collection } from "discord.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
    async loadCommandArrayFrom(dir) {
        dir = `../${dir}`;
        const commands = [];
        const commandsPath = path.join(__dirname, dir);
        const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith("CMD.js"));

        for (const file of commandFiles) {
            const filePath = `${dir}/${file}`;
            const { default: command } = await import(filePath);
            commands.push(command.data.toJSON());
        }

        return commands;
    },
    async loadCommandCollectionFrom(dir){
        dir = `../${dir}`;
        let commands = new Collection();
        const commandsPath = path.join(__dirname, dir);
        const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith("CMD.js"));

        for (const file of commandFiles) {
            const filePath = `${dir}/${file}`;
            const { default: command } = await import(filePath);
            commands.set(command.data.name, command);
        }
        return commands;
    }
};
