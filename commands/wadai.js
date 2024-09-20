const fetch = require('node-fetch');
const { MessageAttachment, MessageEmbed } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const config = require('../botconfig/config.json');

module.exports = {
    name: 'wadai',
    description: 'wadai command',
    async execute(message, args) {
        const userID = message.author.id;
        const whitelistPath = path.join(__dirname, '../database/whitelist.json');

        const whitelist = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));

        if (!whitelist.allowedUsers.includes(userID) && userID !== config.owner && userID !== config.owner2 && userID !== config.owner3) {
            return;
        }

        const user = message.author;
        const displayName = user.displayName;

        const wadaiURL = 'https://wadaiapi-xupk7ji5.b4a.run/?type=雑談';

        try {
            const response = await fetch(wadaiURL).json().url;
            if (!response.ok) throw new Error('Failed to fetch the image');
            const buffer = await response.buffer();

            const filePath = path.join(__dirname, 'omikuji.png');
            await fs.promises.writeFile(filePath, buffer);

            const attachment = new MessageAttachment(filePath);

            await message.channel.send({ files: [attachment] })
            .then(sentMessage => {
                message.react('⭕');
            });

            await fs.promises.unlink(filePath);
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
