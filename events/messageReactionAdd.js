const fetch = require('node-fetch');
const { WebEmbed } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const config = require('../botconfig/config.json');
const quotesPath = path.join(__dirname, '../database/quotes.json');
const whitelistPath = path.join(__dirname, '../database/whitelist.json');
const whitelistUsersPath = path.join(__dirname, '../database/whitelistUsers.json');
const whitelistsPath = path.join(__dirname, '../database/whitelists.json');
const helpsPath = path.join(__dirname, '../database/helps.json');
const helpPages = require('../botconfig/helpPages.json');

module.exports = {
    name: 'messageReactionAdd',
    async execute(reaction, user) {
        const userID = user.id;

        const whitelist = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));

        if (!whitelist.allowedUsers.includes(userID) && userID !== config.owner && userID !== config.owner2 && userID !== config.owner3) {
            return;
        }

        if (reaction.emoji.name === '⬅️' || reaction.emoji.name === '➡️') {
            const helps = JSON.parse(fs.readFileSync(helpsPath, 'utf8'));
            const whitelists = JSON.parse(fs.readFileSync(whitelistsPath, 'utf8'));
            const messageID = reaction.message.id;

            if (whitelists[messageID]) {
                if (userID !== config.owner) {
                    return;
                }
              
                const currentPage = whitelists[messageID].page;
                const newPage = reaction.emoji.name === '➡️' ? currentPage + 1 : currentPage - 1;

                const whitelistUsers = JSON.parse(fs.readFileSync(whitelistUsersPath, 'utf8'));
                const usersPerPage = 5;
                const totalPages = Math.ceil(whitelistUsers.allowedUsers.length / usersPerPage);

                if (newPage > 0 && newPage <= totalPages) {
                    whitelists[messageID].page = newPage;
                    fs.writeFileSync(whitelistsPath, JSON.stringify(whitelists, null, 2), 'utf8');

                    const startIndex = (newPage - 1) * usersPerPage;
                    const endIndex = startIndex + usersPerPage;
                    const usersToShow = whitelistUsers.allowedUsers.slice(startIndex, endIndex);
                    const description = usersToShow.length > 0 ? usersToShow.join('\n') : 'ホワイトリストにユーザーがいません';

                    const embed = new WebEmbed()
                        .setColor('GREEN')
                        .setDescription(`${description}\n\n${newPage}`)
                        .setProvider({ name: `@${user.username}`, url: `https://discord.com/users/${user.id}` })
                        .setTitle(`ホワイトリスト`);

                    reaction.message.edit({ content: `[⁠︎](${embed})` });
                }
            } else if (helps[messageID]) {
                const currentPage = helps[messageID].page;

                const newPage = reaction.emoji.name === '➡️' ? currentPage + 1 : currentPage - 1;

                if (newPage > 0 && newPage <= Object.keys(helpPages).length) {
                    helps[messageID].page = newPage;
                    fs.writeFileSync(helpsPath, JSON.stringify(helps, null, 2), 'utf8');

                    const embed = new WebEmbed()
                    .setColor('GREEN')
                    .setDescription(`${helpPages[newPage]}`)
                    .setProvider({ name: `@${user.username}`, url: `https://discord.com/users/${user.id}` })
                    .setTitle(`ヘルプ`);
                    
                    reaction.message.edit({ content: `[⁠︎](${embed})` });
                }
            }
        } else if (reaction.emoji.name === '🔁') {
            reaction.message.reactions.cache.get('🔁').users.fetch().then(users => {
                if (users.size >= 2) {
                    const messageID = reaction.message.id;
                    const quotes = JSON.parse(fs.readFileSync(quotesPath, 'utf8'));

                    if (quotes[messageID]) {
                        const quoteData = quotes[messageID];
                        const newColor = quoteData.color === true ? false : true;

                        reaction.message.client.users.fetch(quoteData.user)
                            .then(fetchedUser => {
                                const avatarURL = `https://cdn.discordapp.com/avatars/${fetchedUser.id}/${fetchedUser.avatar}.png?size=1024`;
                                const text = quoteData.text;
                                const brand = "Make it a Quote#6666";

                                fetch("https://api.voids.top/fakequote", {
                                    method: "POST",
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        text: text,
                                        avatar: avatarURL,
                                        username: fetchedUser.username,
                                        display_name: fetchedUser.displayName || fetchedUser.username,
                                        color: newColor,
                                        watermark: brand,
                                    })
                                })
                                .then(response => response.json())
                                .then(data => {
                                    const imageUrl = data.url;
                                    const embed = new WebEmbed()
                                        .setColor('GREEN')
                                        .setDescription(`${fetchedUser.username}\n\n${text}`)
                                        .setProvider({ name: `@${user.username}`, url: `https://discord.com/users/${user.id}` })
                                        .setTitle('Make it a Quote')
                                        .setImage(imageUrl);

                                    reaction.message.edit({ content: `[⁠︎](${embed})` })
                                        .then(() => {
                                            quotes[messageID].color = newColor;
                                            fs.writeFileSync(quotesPath, JSON.stringify(quotes, null, 2), 'utf8');
                                        });
                                })
                                .catch(err => {
                                    console.error(err);
                                    const embed = new WebEmbed()
                                        .setColor('RED')
                                        .setDescription('画像生成に失敗しました')
                                        .setProvider({ name: `@${user.username}`, url: `https://discord.com/users/${user.id}` })
                                        .setTitle('エラー');
                                    reaction.message.channel.send({ content: `[⁠︎](${embed})` });
                                });
                            })
                            .catch(err => {
                                console.error(err);
                                const embed = new WebEmbed()
                                    .setColor('RED')
                                    .setDescription('ユーザー情報の取得に失敗しました')
                                    .setProvider({ name: `@${user.username}`, url: `https://discord.com/users/${user.id}` })
                                    .setTitle('エラー');
                                reaction.message.channel.send({ content: `[⁠︎](${embed})` });
                            });
                    }
                }
            })
            .catch(err => {
                console.error(err);
                const embed = new WebEmbed()
                    .setColor('RED')
                    .setDescription('エラーが発生しました')
                    .setProvider({ name: `@${user.username}`, url: `https://discord.com/users/${user.id}` })
                    .setTitle('エラー');
                reaction.message.channel.send({ content: `[⁠︎](${embed})` });
            });
        } else if (reaction.emoji.name === '🗑️') {
            reaction.message.reactions.cache.get('🗑️').users.fetch().then(users => {
                if (users.size >= 2) {
                    const messageID = reaction.message.id;
                    const quotes = JSON.parse(fs.readFileSync(quotesPath, 'utf8'));

                    if (quotes[messageID]) {
                        delete quotes[messageID];
                        fs.writeFileSync(quotesPath, JSON.stringify(quotes, null, 2), 'utf8');

                        const embed = new WebEmbed()
                            .setColor('RED')
                            .setDescription('削除されました')
                            .setProvider({ name: `@${user.username}`, url: `https://discord.com/users/${user.id}` });
                        reaction.message.edit({ content: `[⁠︎](${embed})` });
                    }
                }
            })
            .catch(err => {
                console.error(err);
                const embed = new WebEmbed()
                    .setColor('RED')
                    .setDescription('エラーが発生しました')
                    .setProvider({ name: `@${user.username}`, url: `https://discord.com/users/${user.id}` })
                    .setTitle('エラー');
                reaction.message.channel.send({ content: `[⁠︎](${embed})` });
            });
        }
    },
};
