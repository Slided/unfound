require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const os = require('os'); // Require the os module

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const GUILD_ID = '1295102729546502154'; // Your guild/server ID
const CHANNEL_ID = '1295457014079557673'; // Your channel ID

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Get the computer's name and the user's account name
    const computerName = os.hostname();
    const userName = os.userInfo().username;
    const startTime = new Date().toLocaleTimeString(); // Get the current time

    // Create an embed message
    const embed = new EmbedBuilder()
        .setTitle('Unfoundimgbot Started')
        .setDescription(`Unfoundimgbot started on ${new Date().toLocaleDateString()} on ${computerName} under user ${userName} at ${startTime}`)
        .setColor('#0099ff'); // You can change the color

    // Send the embed message to the specified channel
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel) {
        await channel.send({ embeds: [embed] });
        console.log('Status message sent!');
    } else {
        console.error('Channel not found!');
    }

    // Exit the process after sending the message
    process.exit();
});

// Log the bot in
client.login(process.env.DISCORD_TOKEN);
