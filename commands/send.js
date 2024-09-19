const fs = require('fs');
const path = require('path');
const config = require('../botconfig/config.json');
const { WebEmbed } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'send',
    description: 'send command',
    async execute(message, args, client) {
        const userID = message.author.id;
        if (userID !== config.owner && userID !== config.owner2 && userID !== config.owner3) {
            return;
        }

        if (!args[0]) {
            const embed = new WebEmbed()
            .setColor('RED')
            .setDescription('チャンネルを指定してくださ合い')
            .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
            .setTitle('エラー');
            return message.channel.send({ content: `[⁠︎](${embed})` })
            .then(sentMessage => {
                message.react('❌');
            });
        }

        if (!args[1]) {
            const embed = new WebEmbed()
            .setColor('RED')
            .setDescription('メッセージを入力してくださ合い')
            .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
            .setTitle('エラー');
            return message.channel.send({ content: `[⁠︎](${embed})` })
            .then(sentMessage => {
                message.react('❌');
            });
        }

        const text = args.slice(1).join(' ');

        const channelArg = args[0];

        let channel;
        if (channelArg.startsWith('<#') && channelArg.endsWith('>')) {
          const channelID = channelArg.slice(2, -1);
          channel = await client.channels.fetch(channelID);
        } else {
          channel = await client.channels.fetch(channelArg);
        }

        if (!channel) {
            const embed = new WebEmbed()
            .setColor('RED')
            .setDescription('指定されたチャンネルが見つかりません')
            .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
            .setTitle('エラー');
            return message.channel.send({ content: `[⁠︎](${embed})` })
            .then(sentMessage => {
                message.react('❌');
            });
        }

        try {
            await channel.send(text);
            const embed = new WebEmbed()
            .setColor('GREEN')
            .setDescription(`メッセージを${channel.name}送信しました`)
            .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
            .setTitle('成功');
            return message.channel.send({ content: `[⁠︎](${embed})` })
            .then(sentMessage => {
                message.react('⭕');
            });
        } catch (error) {
            console.error(error);
            await channel.send(text);
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
