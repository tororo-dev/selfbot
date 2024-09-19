const fs = require('fs');
const path = require('path');
const { WebEmbed } = require('discord.js-selfbot-v13');
const config = require('../botconfig/config.json');

module.exports = {
    name: 'clear',
    description: 'clear command',
    execute(message) {
        const userID = message.author.id;
      
        if (userID !== config.owner && userID !== config.owner2 && userID !== config.owner3) {
            return;
        }
      
        const historyDir = path.join('./history');

        fs.rm(historyDir, { recursive: true }, (err) => {
            if (err) {
                console.error(err);
                const embed = new WebEmbed()
                .setColor('RED')
                .setDescription('エラーが発生しました')
                .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
                .setTitle('エラー');
                return message.channel.send({ content: `[⁠︎](${embed})` })
                .then(sentMessage => {
                    message.react('❌');
                });
            }

            const embed = new WebEmbed()
            .setColor('GREEN')
            .setDescription('履歴を全て削除しました')
            .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
            .setTitle('成功');
            message.channel.send({ content: `[⁠︎](${embed})` })
            .then(sentMessage => {
                message.react('⭕');
            });
        });
    },
};
