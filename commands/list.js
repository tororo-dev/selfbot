const fs = require('fs');
const path = require('path');
const { WebEmbed, MessageAttachment } = require('discord.js-selfbot-v13');
const config = require('../botconfig/config.json');

module.exports = {
    name: 'list',
    description: 'list command',
    execute(message, args) {
        const userID = message.author.id;
      
        const whitelistPath = path.join(__dirname, '../database/whitelist.json');

        const whitelist = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));
      
        if (!whitelist.allowedUsers.includes(userID) && userID !== config.owner && userID !== config.owner2 && userID !== config.owner3) {
            return;
        }
      
        const channelHistoryDir = path.join(`./history/${message.channel.id}`);
        fs.readdir(channelHistoryDir, (err, files) => {
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
          
            const snipeFilePath = path.join(channelHistoryDir, 'list.txt');

            fs.readFile(snipeFilePath, 'utf8', (err, data) => {
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

                const attachment = new MessageAttachment(snipeFilePath);
                message.channel.send({ files: [attachment] })
                .then(sentMessage => {
                    message.react('⭕');
                });
            });
        });
    },
};
