const fetch = require('node-fetch');
const { WebEmbed } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const config = require('../botconfig/config.json');

module.exports = {
    name: 'fiq',
    description: 'fiq command',
    async execute(message, args) {
        const userID = message.author.id;
      
        const whitelistPath = path.join(__dirname, '../database/whitelist.json');
        const quotesPath = path.join(__dirname, '../database/quotes.json');

        const whitelist = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));
        const quotes = JSON.parse(fs.readFileSync(quotesPath, 'utf8'));
      
        if (!whitelist.allowedUsers.includes(userID) && userID !== config.owner && userID !== config.owner2 && userID !== config.owner3) {
            return;
        }
      
        if (!args[0]) {
            const embed = new WebEmbed()
            .setColor('RED')
            .setDescription('ユーザーを入力してください')
            .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
            .setTitle('エラー');
            return message.channel.send({ content: `[⁠︎](${embed})` })
            .then(sentMessage => {
                message.react('❌');
            });
        }
      
        if (!args.slice(1).join(' ')) {
           const embed = new WebEmbed()
            .setColor('RED')
            .setDescription('テキストを入力してください')
            .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
            .setTitle('エラー');
            return message.channel.send({ content: `[⁠︎](${embed})` })
            .then(sentMessage => {
                message.react('❌');
            });
        }
      
        const userIdentifier = args[0];
        let content = args.slice(1).join(' ');

        const color = content.endsWith(' c') ? true : false;
        if (color === true) {
            content = content.slice(0, -2).trim();
        }

        let user;

        if (userIdentifier.startsWith('<@') && userIdentifier.endsWith('>')) {
            user = message.mentions.users.first() || await message.client.users.fetch(userIdentifier.slice(2, -1)).catch(() => null);
        } else if (/^\d+$/.test(userIdentifier)) {
            user = await message.client.users.fetch(userIdentifier).catch(() => null);
        } else if (message.guild) {
            const member = message.guild.members.cache.find((m) => m.user.tag === userIdentifier);
            user = member ? member.user : null;
        }

        if (!user) {
            const embed = new WebEmbed()
            .setColor('RED')
            .setDescription('指定されたユーザーが見つかりません')
            .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
            .setTitle('エラー');
            return message.channel.send({ content: `[⁠︎](${embed})` })
            .then(sentMessage => {
                message.react('❌');
            });
        }

        const avatarURL = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=1024`;
        const displayName = user.displayName;
        const name = user.username;
        const text = content;
        const brand = "Make it a Quote#6666";
        fetch("https://api.voids.top/fakequote", {
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
            .setDescription(`${user.username}\n\n${content}`)
            .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
            .setTitle('Make it a Quote')
            .setImage(imageUrl);

            message.channel.send({ content: `[⁠︎](${embed})` })
            .then(sentMessage => {
                quotes[sentMessage.id] = {
                    user: user.id,
                    text: content,
                    color: color
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
            .then(sentMessage => {
                message.react('❌');
            });
        });
    },
};
