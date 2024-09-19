const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const { MessageAttachment, WebEmbed } = require('discord.js-selfbot-v13');
const config = require('../botconfig/config.json');

module.exports = {
    name: 'frame',
    description: 'frame command',
    async execute(message, args) {
        const userID = message.author.id;
        const whitelistPath = path.join(__dirname, '../database/whitelist.json');

        const whitelist = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));

        if (!whitelist.allowedUsers.includes(userID) && userID !== config.owner && userID !== config.owner2 && userID !== config.owner3) {
            return;
        }

        if (args.length === 0) {
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

        const userIdentifier = args[0];
        let targetUser;

        if (userIdentifier.startsWith('<@') && userIdentifier.endsWith('>')) {
            targetUser = message.mentions.users.first() || await message.client.users.fetch(userIdentifier.slice(2, -1)).catch(() => null);
        } else if (/^\d+$/.test(userIdentifier)) {
            targetUser = await message.client.users.fetch(userIdentifier).catch(() => null);
        } else if (message.guild) {
            const member = message.guild.members.cache.find((m) => m.user.tag === userIdentifier);
            targetUser = member ? member.user : null;
        }

        if (!targetUser) {
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

        const targetAvatarURL = targetUser.displayAvatarURL({ format: 'png', size: 512 });

        const frameURL = 'https://cdn.glitch.global/77c2d089-45a9-41aa-82d0-a5d46a463c4c/frame.png?v=1719105103429';
        const outputDir = path.join(__dirname, '../images');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputImagePath = path.join(outputDir, `${targetUser.id}_framed.png`);

        try {
            const canvas = createCanvas(512, 512);
            const context = canvas.getContext('2d');

            const imgs = [frameURL, targetAvatarURL];

            const images = await Promise.all(imgs.map(url => loadImage(url)));

            context.drawImage(images[1], 89, 89, 335, 335);
            context.drawImage(images[0], 0, 0, 512, 512);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = avg;
                data[i + 1] = avg;
                data[i + 2] = avg;
            }

            context.putImageData(imageData, 0, 0);

            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(outputImagePath, buffer);

            // ファイルの存在を確認する
            if (!fs.existsSync(outputImagePath)) {
                throw new Error(`File not found: ${outputImagePath}`);
            }

            const embed = new WebEmbed()
                .setColor('GREEN')
                .setDescription(targetUser.username)
                .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
                .setTitle('遺影');

            const attachment = new MessageAttachment(outputImagePath);

            await message.channel.send({ content: `[⁠︎](${embed})`, files: [attachment] })
                .then(sentMessage => {
                    message.react('⭕');
                });

            // 確認後にファイルを削除
            fs.unlinkSync(outputImagePath);
        } catch (err) {
            console.error(err);
            const embed = new WebEmbed()
                .setColor('RED')
                .setDescription('エラーが発生しました')
                .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
                .setTitle('エラー');
            await message.channel.send({ content: `[⁠︎](${embed})` })
                .then(sentMessage => {
                    message.react('❌');
                });
        }
    },
};
