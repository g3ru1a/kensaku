const fetch = require("node-fetch");
const logger = require("../logger");
const { SlashCommandBuilder } = require("discord.js");
const MangaEmbed = require("../embeds/manga");

const mu_series_search_url = "https://api.mangaupdates.com/v1/series/search";

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
let options = function (vars) {
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
};

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

        let m_Data = null;

        await fetch(url, opt).then(handleResponse).then(handleData).catch(handleError);

        if(m_Data){
            let mu_url = await fetchMangaUpdatesData(m_Data);
            m_Data.data.Media.mu_url = mu_url;
            let embed = MangaEmbed.build(m_Data.data.Media, detailed);
            await interaction.reply({ embeds: [embed] });
        }

        function handleResponse(response) {
            return response.json().then(function (json) {
                return response.ok ? json : Promise.reject(json);
            });
        }

        async function handleData(data) {
            console.log(`[M] ✔️ '${search_query}' Sucess.`);
            m_Data = data;
        }

        async function handleError(error) {
            if (error.errors && error.errors.length > 0 && error.errors[0].status == 404) {
                console.log(`[M] ❗  '${search_query}' Not Found.`);
                await interaction.reply("Couldn't find any manga.");
                return;
            }
            logger.error(error, `Error while looking for '${search_query}' Manga. HTTP Response:`);
            console.log(`[M] ❌  '${search_query}'. Check Logs.`);
            await interaction.reply("Something went wrong, check console.");
        }

        async function fetchMangaUpdatesData(AnilistData) {
            let response = null;
            
            await fetch(mu_series_search_url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    search: search_query,
                    stype: "title",
                }),
            })
                .then(handleResponse)
                .then((res) => (response = res));

            if(response.total_hits > 0){
                let res = response.results[0];
                return res.record.url;
            }
            return null;
        };
    },
};
