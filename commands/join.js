const fs = require('fs');
const path = require('path');
const config = require('../botconfig/config.json');
const { WebEmbed } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'join',
    description: 'join command',
    async execute(message, args, client) {
        const userID = message.author.id;
        if (userID !== config.owner && userID !== config.owner2 && userID !== config.owner3) {
            return;
        }

        if (!args[0]) {
            const embed = new WebEmbed()
            .setColor('RED')
            .setDescription('招待コードを指定してくださ合い')
            .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
            .setTitle('エラー');
            return message.channel.send({ content: `[⁠︎](${embed})` })
            .then(sentMessage => {
                message.react('❌');
            });
        }

        const inviteCode = args[0];

        try {
            await client.acceptInvite(inviteCode);
            const embed = new WebEmbed()
            .setColor('GREEN')
            .setDescription(`サーバーに参加しました`)
            .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
            .setTitle('成功');
            return message.channel.send({ content: `[⁠︎](${embed})` })
            .then(sentMessage => {
                message.react('⭕');
            });
        } catch (error) {
            console.error(error);
            const embed = new WebEmbed()
            .setColor('RED')
            .setDescription(`エラーが発生しました`)
            .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
            .setTitle('エラー');
            return message.channel.send({ content: `[⁠︎](${embed})` })
            .then(sentMessage => {
                message.react('❌');
            });
        }
    },
};
