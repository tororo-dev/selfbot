const { WebEmbed } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const config = require('../botconfig/config.json');

module.exports = {
    name: 'help',
    description: 'help command',
    async execute(message) {
        const userID = message.author.id;
      
        const whitelistPath = path.join(__dirname, '../database/whitelist.json');
        const helpsPath = path.join(__dirname, '../database/helps.json');

        const whitelist = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));
        const helps = JSON.parse(fs.readFileSync(helpsPath, 'utf8'));
      
        if (!whitelist.allowedUsers.includes(userID) && userID !== config.owner && userID !== config.owner2 && userID !== config.owner3) {
            return;
        }
      
        const embed = new WebEmbed()
        .setColor('GREEN')
        .setDescription('BOT\n\n*help\nヘルプを表示します\n\n()は任意、[]は必須')
        .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
        .setTitle('ヘルプ');
        message.channel.send({ content: `[⁠︎](${embed})` })
        .then(sentMessage => {
            helps[sentMessage.id] = {
                "page": 1
            };

            fs.writeFileSync(helpsPath, JSON.stringify(helps, null, 2), 'utf8');
                  
            message.react('⭕');
            sentMessage.react('⬅️');
            sentMessage.react('➡️');
        });
    },
};
