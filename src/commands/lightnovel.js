const fetch = require("node-fetch");
const logger = require("../logger");
const { SlashCommandBuilder } = require("discord.js");
const LNEmbed = require("../embeds/lightnovel");

const query = `
query ($search_query: String) { 
  Media (search: $search_query, type: MANGA, format: NOVEL) {
    id,
    idMal,
    title {
      romaji
      english
      native
    },
    description,
    status,
    chapters,
    volumes,
    genres,
    coverImage{
        extraLarge,
        color
    },
    staff {
        edges {
            node {
                name {
                    full
                }
            }
            role
        }
    }
  }
}
`;

const url = "https://graphql.anilist.co";
let options = function(vars) {
    return {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            query: query,
            variables: vars,
        }),
    };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kl")
        .setDescription("Searches for Light Novels!")
        .addStringOption((option) => option.setName("name").setDescription("Terms to lookup").setRequired(true))
        .addBooleanOption((option) => option.setName("detailed").setDescription("Show Full Info")),
    async execute(interaction) {
        this.fetchLightNovel(
            interaction,
            interaction.options.getString("name"),
            interaction.options.getBoolean("detailed")
        );
    },
    async fetchLightNovel(interaction, search_query, detailed = false) {
        let opt = options({
            search_query,
        });

        fetch(url, opt).then(handleResponse).then(handleData).catch(handleError);

        function handleResponse(response) {
            return response.json().then(function (json) {
                return response.ok ? json : Promise.reject(json);
            });
        }

        async function handleData(data) {
            console.log(`[LN] ✔️ '${search_query}' Sucess.`);
            let embed = LNEmbed.build(data.data.Media, detailed);
            await interaction.reply({ embeds: [embed] });
        }

        async function handleError(error) {
            if (error.errors[0].status == 404) {
                console.log(`[LN] ❗ '${search_query}' Not Found.`);
                await interaction.reply("Couldn't find any lightnovel.");
                return;
            }
            logger.error(error, `Error while looking for '${search_query}' Light Novel. HTTP Response:`);
            console.log(`[LN] ❌ '${search_query}'. Check Logs.`);
            await interaction.reply("Something went wrong, check console.");
        }
    },
};
