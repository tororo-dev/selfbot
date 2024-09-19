const fetch = require('node-fetch');
const { WebEmbed, MessageAttachment } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const config = require('../botconfig/config.json');

module.exports = {
    name: 'snipe',
    description: 'snipe command',
    execute(message, args) {
        const userID = message.author.id;

        const whitelistPath = path.join(__dirname, '../database/whitelist.json');
        const quotesPath = path.join(__dirname, '../database/quotes.json');

        const whitelist = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));
        const quotes = JSON.parse(fs.readFileSync(quotesPath, 'utf8'));

        if (!whitelist.allowedUsers.includes(userID) && userID !== config.owner && userID !== config.owner2 && userID !== config.owner3) {
            return;
        }

        let snipeCount = 1;
        const useMIQ = args.includes('miq');
        const useColor = args.includes('c');

        if (args.length > 0) {
            const parsedCount = parseInt(args[0]);
            if (!isNaN(parsedCount) && parsedCount > 0) {
                snipeCount = parsedCount;
            } else if (!useMIQ && !useColor) {
                const embed = new WebEmbed()
                .setColor('RED')
                .setDescription('有効なカウントを指定してください')
                .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
                .setTitle('エラー');
                return message.channel.send({ content: `[⁠︎](${embed})` })
                .then(sentMessage => {
                    message.react('❌');
                });
            }
        }

        const channelHistoryDir = path.join(`./history/${message.channel.id}`);

        if (!channelHistoryDir) {
            const embed = new WebEmbed()
            .setColor('RED')
            .setDescription('削除/編集されたメッセージはありません')
            .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
            .setTitle('エラー');
            return message.channel.send({ content: `[⁠︎](${embed})` })
            .then(sentMessage => {
                message.react('❌');
            });
        }

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
            files = files.filter(file => file.endsWith('.txt') && file !== 'list.txt').sort((a, b) => {
                const numA = parseInt(a.replace('.txt', ''), 10);
                const numB = parseInt(b.replace('.txt', ''), 10);
                return numB - numA;
            });

            if (files.length === 0) {
                const embed = new WebEmbed()
                .setColor('RED')
                .setDescription('削除/編集されたメッセージはありません')
                .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
                .setTitle('エラー');
                return message.channel.send({ content: `[⁠︎](${embed})` })
                .then(sentMessage => {
                    message.react('❌');
                });
            }

            const snipeIndex = Math.min(snipeCount, files.length) - 1;
            const snipeFile = files[snipeIndex];
            const snipeFilePath = path.join(channelHistoryDir, snipeFile);

            fs.readFile(snipeFilePath, 'utf8', async (err, data) => {
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

                const content = data.split('\n');
                let username = '';
                let messageContent = '';

                if (content[0].startsWith('deleted ')) {
                    username = content[0].split('deleted ')[1].split(':')[0];
                    messageContent = content.slice(2).join('\n');
                } else if (content[0].startsWith('edited ')) {
                    username = content[0].split('edited ')[1].split(':')[0];
                    const oldContentIndex = content.indexOf('old content:') + 1;
                    const newContentIndex = content.indexOf('new content:');
                    messageContent = content.slice(oldContentIndex, newContentIndex).join('\n');
                }

                const user = message.client.users.cache.find(u => u.username === username);
                if (!user) {
                    const embed = new WebEmbed()
                    .setColor('RED')
                    .setDescription('ユーザーが見つかりません')
                    .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
                    .setTitle('エラー');
                    return message.channel.send({ content: `[⁠︎](${embed})` })
                    .then(sentMessage => {
                        message.react('❌');
                     });
                }

                const color = useColor ? true : false;
                if (color === true) {
                    messageContent = messageContent.trim();
                }

                if (useMIQ) {
                    const avatarURL = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=1024`;
                    const displayName = user.displayName || user.username; // Use username if displayName is not available
                    const text = messageContent;
                    const icon = avatarURL;
                    const brand = "Make it a Quote#6666";

                    fetch("https://api.voids.top/fakequote", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            text: text,
                            avatar: icon,
                            username: user.username,
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
                        .setDescription(`${user.username}\n\n${messageContent}`)
                        .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
                        .setTitle('Make it a Quote')
                        .setImage(imageUrl);
                        message.channel.send({ content: `[⁠︎](${embed})` })
                        .then(sentMessage => {
                            quotes[sentMessage.id] = {
                                user: user.id,
                                text: messageContent,
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
                } else {
                    const attachment = new MessageAttachment(snipeFilePath);
                    message.channel.send({ files: [attachment] })
                    .then(sentMessage => {
                        message.react('⭕');
                    });
                }
            });
        });
    },
};
