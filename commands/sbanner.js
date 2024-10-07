const fs = require('fs');
const path = require('path');
const config = require('../botconfig/config.json');
const { WebEmbed } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'sbanner',
    description: 'sbanner command',
    async execute(message, args) {
        const userID = message.author.id;

        const whitelistPath = path.join(__dirname, '../database/whitelist.json');
        const whitelist = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));

        if (!whitelist.allowedUsers.includes(userID) && userID !== config.owner && userID !== config.owner2 && userID !== config.owner3) {
            return;
        }

        const serverID = args[0];
        let server;

        if (serverID) {
            try {
                server = await message.client.guilds.fetch(serverID);
            } catch (error) {
                const embed = new WebEmbed()
                .setColor('RED')
                .setDescription('指定されたサーバーが見つかりません')
                .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
                .setTitle('エラー');
                return message.channel.send({ content: `[⁠︎](${embed})` })
                .then(sentMessage => {
                    message.react('❌');
                });
            }
        } else {
            if (!message.guild) {
                const embed = new WebEmbed()
                .setColor('RED')
                .setDescription('このコマンドはサーバー内で使用してください')
                .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
                .setTitle('エラー');
                return message.channel.send({ content: `[⁠︎](${embed})` })
                .then(sentMessage => {
                    message.react('❌');
                });
            }
            server = message.guild;
        }

        if (server.banner) {
            const bannerURL = server.bannerURL({ format: 'png', size: 1024 });
              
            message.channel.send(bannerURL)
            .then(msg =>{
                message.react('⭕');
            });
        } else {
            const embed = new WebEmbed()
            .setColor('RED')
            .setDescription(`${server.name}にはバナーがありません`)
            .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
            .setTitle('エラー');
              
            message.channel.send({ content: `[⁠︎](${embed})` })
            .then(msg =>{
                message.react('❌');
            });
        }
    },
};
