const fs = require('fs');
const path = require('path');
const config = require('../botconfig/config.json');
const { WebEmbed } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'white',
    description: 'white command',
    async execute(message, args) {
        const userID = message.author.id;

        if (userID !== config.owner && userID !== config.owner2 && userID !== config.owner3) {
            return;
        }

        if (!args[0] || !['add', 'remove', 'list'].includes(args[0])) {
            const embed = new WebEmbed()
                .setColor('RED')
                .setDescription('add、remove、またはlistを入力してください')
                .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
                .setTitle('エラー');
            return message.channel.send({ content: `[⁠︎](${embed})` })
                .then(sentMessage => {
                    message.react('❌');
                });
        }

        const operation = args[0];
        const whitelistPath = path.join(__dirname, '../database/whitelist.json');
        const whitelistUsersPath = path.join(__dirname, '../database/whitelistUsers.json');
        const whitelistsPath = path.join(__dirname, '../database/whitelists.json');

        let whitelist = { allowedUsers: [] };
        let whitelistUsers = { allowedUsers: [] };
        let whitelists = {};

        try {
            whitelist = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));
        } catch (err) {
            console.error(err);
        }

        try {
            whitelistUsers = JSON.parse(fs.readFileSync(whitelistUsersPath, 'utf8'));
        } catch (err) {
            console.error(err);
        }

        try {
            whitelists = JSON.parse(fs.readFileSync(whitelistsPath, 'utf8'));
        } catch (err) {
            console.error(err);
        }

        if (operation === 'list') {
            const page = 1;
            const usersPerPage = 5;
            const startIndex = (page - 1) * usersPerPage;
            const endIndex = startIndex + usersPerPage;
            const usersToShow = whitelistUsers.allowedUsers.slice(startIndex, endIndex);
            const description = usersToShow.length > 0 ? usersToShow.join('\n') : 'ホワイトリストにユーザーがいません';

            const embed = new WebEmbed()
                .setColor('GREEN')
                .setDescription(`${description}\n\n${page}`)
                .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
                .setTitle(`ホワイトリスト`);

            message.channel.send({ content: `[⁠︎](${embed})` })
                .then(sentMessage => {
                    message.react('⭕');
                    whitelists[sentMessage.id] = { page };
                    fs.writeFileSync(whitelistsPath, JSON.stringify(whitelists, null, 2), 'utf8');
                    sentMessage.react('⬅️').then(() => sentMessage.react('➡️'));
                });

            return;
        }

        if (!args[1]) {
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

        const userIdentifier = args[1];
        let user;

        if (userIdentifier.startsWith('<@') && userIdentifier.endsWith('>')) {
            user = await message.mentions.users.first() || await message.client.users.fetch(userIdentifier.slice(2, -1)).catch(() => null);
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

        if (operation === 'add') {
            if (whitelist.allowedUsers.includes(user.id)) {
                const embed = new WebEmbed()
                    .setColor('RED')
                    .setDescription('ユーザーはすでにホワイトリストに載っています')
                    .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
                    .setTitle('エラー');
                return message.channel.send({ content: `[⁠︎](${embed})` })
                    .then(sentMessage => {
                        message.react('❌');
                    });
            }
            whitelist.allowedUsers.push(user.id);
            whitelistUsers.allowedUsers.push(user.username);
            fs.writeFile(whitelistPath, JSON.stringify(whitelist, null, 2), (err) => {
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
                fs.writeFile(whitelistUsersPath, JSON.stringify(whitelistUsers, null, 2), (err) => {
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
                        .setDescription(`${user.username}ホワイトリストに追加されました`)
                        .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
                        .setTitle('成功');
                    message.channel.send({ content: `[⁠︎](${embed})` })
                        .then(sentMessage => {
                            message.react('⭕');
                        });
                });
            });
        } else if (operation === 'remove') {
            if (!whitelist.allowedUsers.includes(user.id)) {
                const embed = new WebEmbed()
                    .setColor('RED')
                    .setDescription('ユーザーはホワイトリストに載っていません')
                    .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
                    .setTitle('エラー');
                return message.channel.send({ content: `[⁠︎](${embed})` })
                    .then(sentMessage => {
                        message.react('❌');
                    });
            }
            whitelist.allowedUsers = whitelist.allowedUsers.filter(allowedUserId => allowedUserId !== user.id);
            whitelistUsers.allowedUsers = whitelistUsers.allowedUsers.filter(username => username !== user.username);
            fs.writeFile(whitelistPath, JSON.stringify(whitelist, null, 2), (err) => {
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
                fs.writeFile(whitelistUsersPath, JSON.stringify(whitelistUsers, null, 2), (err) => {
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
                        .setDescription(`${user.username}ホワイトリストから削除されました`)
                        .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
                        .setTitle('成功');
                    message.channel.send({ content: `[⁠︎](${embed})` })
                        .then(sentMessage => {
                            message.react('⭕');
                        });
                });
            });
        }
    },
};
