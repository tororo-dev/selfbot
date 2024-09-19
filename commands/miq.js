const fetch = require('node-fetch');
const { WebEmbed } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const config = require('../botconfig/config.json');

module.exports = {
    name: 'miq',
    description: 'miq command',
    async execute(message, args) {
        const userID = message.author.id;
      
        const whitelistPath = path.join(__dirname, '../database/whitelist.json');
        const quotesPath = path.join(__dirname, '../database/quotes.json');

        const whitelist = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));
        const quotes = JSON.parse(fs.readFileSync(quotesPath, 'utf8'));

        if (!whitelist.allowedUsers.includes(userID) && userID !== config.owner && userID !== config.owner2 && userID !== config.owner3) {
            return;
        }
      
        if (message.reference) {
            const repliedMessage = message.channel.messages.cache.get(message.reference.messageId);
            const user = repliedMessage.author;
            const avatarURL = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=1024`;
            const displayName = user.displayName;
            const name = user.username;
            const text = repliedMessage.content;
            const brand = "Make it a Quote#6666";
            const color = args[0] === 'c' ? true : false;

            fetch("https://api.voids.top/quote", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    avatar: avatarURL,
                    username: name,
                    display_name: displayName,
                    color: color,
                    watermark: brand,
                })
            })
            .then(response => response.json())
            .then(data => {
                const imageUrl = data.url;
                const embed = new WebEmbed()
                    .setColor('GREEN')
                    .setDescription(`${repliedMessage.author.username}\n\n${repliedMessage.content}`)
                    .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
                    .setTitle('Make it a Quote')
                    .setImage(imageUrl);

                message.channel.send({ content: `[⁠︎](${embed})` })
                .then(sentMessage => {
                    quotes[sentMessage.id] = {
                        "user": user.id,
                        "text": repliedMessage.content,
                        "color": color
                    };

                    fs.writeFileSync(quotesPath, JSON.stringify(quotes, null, 2), 'utf8');
                  
                    message.react('⭕');
                    sentMessage.react('🔁');
                    sentMessage.react('🗑️');
                });
            })
            .catch(err => {
                console.error(err);
                const embed = new WebEmbed()
                .setColor('RED')
                .setDescription('エラーが発生しました')
                .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
                .setTitle('エラー');
              
                message.channel.send({ content: `[⁠︎](${embed})` })
                .then(msg =>{
                    message.react('❌');
                });
            });
        }
    },
};
