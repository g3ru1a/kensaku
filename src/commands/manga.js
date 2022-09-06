const fetch = require("node-fetch");
const logger = require("../logger");
const { SlashCommandBuilder } = require("discord.js");
const MangaEmbed = require("../embeds/manga");

const query = `
query ($search_query: String) { 
  Media (search: $search_query, type: MANGA, sort: POPULARITY_DESC, isAdult: false) {
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
    format,
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
        .setName("km")
        .setDescription("Searches for Manga!")
        .addStringOption((option) => option.setName("name").setDescription("Terms to lookup").setRequired(true))
        .addBooleanOption((option) => option.setName("detailed").setDescription("Show Full Info")),
    async execute(interaction) {
        this.fetchManga(interaction, interaction.options.getString("name"), interaction.options.getBoolean("detailed"));
    },
    async fetchManga(interaction, search_query, detailed = false) {
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
            console.log(`[M] ✔️ '${search_query}' Sucess.`);
            let embed = MangaEmbed.build(data.data.Media, detailed);
            await interaction.reply({ embeds: [embed] });
        }

        async function handleError(error) {
            if (error.errors[0].status == 404) {
                console.log(`[M] ❗  '${search_query}' Not Found.`);
                await interaction.reply("Couldn't find any manga.");
                return;
            }
            logger.error(error, `Error while looking for '${search_query}' Manga. HTTP Response:`);
            console.log(`[M] ❌  '${search_query}'. Check Logs.`);
            await interaction.reply("Something went wrong, check console.");
        }
    },
};
