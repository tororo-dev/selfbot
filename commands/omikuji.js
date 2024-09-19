const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const config = require('../botconfig/config.json');

module.exports = {
    name: 'omikuji',
    description: 'omikuji command',
    async execute(message, args) {
        const userID = message.author.id;
        const whitelistPath = path.join(__dirname, '../database/whitelist.json');

        const whitelist = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));

        if (!whitelist.allowedUsers.includes(userID) && userID !== config.owner && userID !== config.owner2 && userID !== config.owner3) {
            return;
        }

        const user = message.author;
        const avatarURL = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=1024`;
        const displayName = user.displayName;

        const omikujiURL = `https://omikujiapi.onrender.com/?name=${displayName}&icon=${avatarURL}`;

        try {
            const response = await fetch(omikujiURL);
            const data = await response.json();
            const imageURL = data.url;

            message.channel.send(imageURL);
        } catch (err) {
            console.error(err);
            const embed = new MessageEmbed()
            .setColor('RED')
            .setDescription('エラーが発生しました')
            .setAuthor(`@${message.author.username}`, avatarURL, `https://discord.com/users/${message.author.id}`)
            .setTitle('エラー');

            message.channel.send({ embeds: [embed] })
            .then(() => {
                message.react('❌');
            });
        }
    },
};
