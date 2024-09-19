const fetch = require('node-fetch');
const { MessageAttachment, WebEmbed } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const config = require('../botconfig/config.json');
const { JSDOM } = require('jsdom');

module.exports = {
    name: 'gemini',
    description: 'gemini command',
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
      
        const url = `https://gemini-text-generate-api.vercel.app/?text=${inputText}`;

        try {
            if (inputText === 'clear') {
                if (config.owner && userID !== config.owner) {
                    return;
                }

                fetch(url);
                
                const embed = new WebEmbed()
                .setColor('GREEN')
                .setDescription('履歴を削除しました')
                .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
                .setTitle('成功');
                return message.channel.send({ content: `[⁠︎](${embed})` })
                .then(sentMessage => {
                    message.react('⭕');
                });
            }
            
            fetch(url)
                .then(response => response.text())
                .then(data => {
                    const dom = new JSDOM(data);
                    const document = dom.window.document;

                    let textContent = '';
                    const nodes = [document.body];

                    while (nodes.length > 0) {
                        const node = nodes.pop();

                        if (node.nodeType === node.TEXT_NODE) {
                            textContent += node.textContent;
                        } else if (node.nodeType === node.ELEMENT_NODE) {
                            nodes.push(...node.childNodes);
                        }
                    }
                    
                    message.channel.send(textContent)
                    .then(sentMessage => {
                        message.react('⭕');
                    });
            });
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
