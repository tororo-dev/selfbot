const { MessageAttachment, WebEmbed } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const config = require('../botconfig/config.json');
const ai = require('unlimited-ai');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    name: 'gpt4',
    description: 'gpt4 command',
    async execute(message, args) {
        const userID = message.author.id;

        const whitelistPath = path.join(__dirname, '../database/whitelist.json');

        const whitelist = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));

        if (!whitelist.allowedUsers.includes(userID) && userID !== config.owner && userID !== config.owner2 && userID !== config.owner3) {
            return;
        }
        
        const inputText = args.join(' ');

        if (!inputText) {
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

        try {
            const filePath = path.join(__dirname, 'database', `${uuid}.txt`);
            const model = 'gpt-4';
            const text = [
                { role: 'user', content: inputText },
                { role: 'system', content: 'あなたは優秀なアシスタントです。' }
            ];
            fs.writeFile(filePath, await ai.generate(model, text))
            const attachment = new MessageAttachment(filePath);
            await message.channel.send({ attachment: [attachment] })
        } catch (err) {
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
        }
    },
};
