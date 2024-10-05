const fs = require('fs');
const path = require('path');
const config = require('../botconfig/config.json');
const { WebEmbed } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'ping',
    description: 'ping command',
    async execute(message, args, client) {
        const userID = message.author.id;
        if (userID !== config.owner && userID !== config.owner2 && userID !== config.owner3) {
            return;
        }
      
        try {
            message.channel.send('Pinging...').then(firstMessage => {
                const ping = firstMessage.createdTimestamp - message.createdTimestamp;
                const embed = new WebEmbed()
                .setColor('GREEN')
                .setDescription(`${ping}ms`)
                .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
                .setTitle('Pong!');
                return firstMessage.edit({ content: `[⁠︎](${embed})` })
                .then(sentMessage => {
                    message.react('⭕');
                });
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
