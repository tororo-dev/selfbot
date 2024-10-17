const { Client, Intents, Collection, WebEmbed } = require('discord.js-selfbot-v13');
const fetch = require('node-fetch');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const config = require('./botconfig/config.json');
const { Jishaku } = require('@djsk/v13');

const client = new Client({
  checkUpdate: false,
});

const jsk = new Jishaku(client, {
    useableUserId: ["1187337651146215496"],
    allowMultiShRunning: false,
    prefix: "*",
    encoding: "UTF-8",
});

const http = require('http');
http.createServer(function (request, response) {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Bot is online!');
}).listen(3000);

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const commandData = require(`./commands/${file}`);
    client.commands.set(commandData.name, commandData);
    console.log(chalk.green(`Loaded Command: ${file}`));
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const eventData = require(`./events/${file}`);
    if (eventData.once) {
        client.once(eventData.name, (...args) => eventData.execute(...args, client));
    } else {
        client.on(eventData.name, (...args) => eventData.execute(...args, client));
    }
    console.log(chalk.green(`Loaded Event: ${file}`));
}

client.on("messageCreate", async (message) => {
  await jsk.onMessageCreated(message);
});

client.login(process.env.token);
