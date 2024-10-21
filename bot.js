require('dotenv').config();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;

let searchResults = {};
let searchIndex = {};

// Fetch images from Google Custom Search API
async function fetchImages(query) {
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${SEARCH_ENGINE_ID}&searchType=image&key=${GOOGLE_API_KEY}&num=10`;
    try {
        const response = await axios.get(url);
        return response.data.items.map(item => ({
            title: item.title,
            imageUrl: item.link
        }));
    } catch (error) {
        console.error('Error fetching images:', error);
        return [];
    }
}

// Create an embed with the current image
function createImageEmbed(query, imageData, currentIndex) {
    const embed = new EmbedBuilder()
        .setTitle(`Result for "${query}"`)
        .setDescription(imageData.title)
        .setImage(imageData.imageUrl)
        .setFooter({ text: `Image ${currentIndex + 1} of ${searchResults[query].length}` });
    return embed;
}

// Handle the !image command
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!image')) {
        const query = message.content.split(' ').slice(1).join(' ');
        if (!query) {
            return message.reply('Please provide a search query.');
        }

        const images = await fetchImages(query);
        if (images.length === 0) {
            return message.reply('No images found for this query.');
        }

        searchResults[query] = images;
        searchIndex[query] = 0;

        const imageEmbed = createImageEmbed(query, images[0], 0);
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
            );

        const reply = await message.reply({ embeds: [imageEmbed], components: [row] });
        message.channel.activeMessage = reply;
    }
});

// Handle button interactions
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const query = interaction.message.embeds[0].title.split('"')[1];
    let currentIndex = searchIndex[query];

    if (interaction.customId === 'next') {
        currentIndex++;
    } else if (interaction.customId === 'previous') {
        currentIndex--;
    }

    searchIndex[query] = currentIndex;

    const imageEmbed = createImageEmbed(query, searchResults[query][currentIndex], currentIndex);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('previous')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentIndex === 0),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentIndex === searchResults[query].length - 1)
        );

    await interaction.update({ embeds: [imageEmbed], components: [row] });
});

// Change bot status when it is ready
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Change bot status
    const statusOptions = [
        { name: 'discord.gg/gqUUZJXB9B', type: 3 },  // WATCHING
        { name: 'do !image to use me!', type: 3 }, // LISTENING
        { name: 'Local Bot Hosting - DM @myaccountisrare', type: 1 }, // STREAMING
    ];

    // Set an interval to change status every 10 seconds
    setInterval(() => {
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        client.user.setPresence({
            activities: [{ name: status.name, type: status.type }],
            status: 'online'
        });
        console.log(`Status changed to: ${status.name}`);
    }, 60000);  // Change status every 10 seconds
});

// Log the bot in
client.login(process.env.DISCORD_TOKEN);

