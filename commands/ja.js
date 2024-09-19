const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const config = require('../botconfig/config.json');
const whitelistPath = path.join(__dirname, '../whitelist.json');
const { WebEmbed } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'ja',
    description: 'ja command',
    async execute(message, args) {
        const userID = message.author.id;

        const whitelistPath = path.join(__dirname, '../database/whitelist.json');

        const whitelist = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));

        if (!whitelist.allowedUsers.includes(userID) && userID !== config.owner && userID !== config.owner2 && userID !== config.owner3) {
            return;
        }
        
        const repliedMessage = message.channel.messages.cache.get(message.reference.messageId);
      
        if (repliedMessage) {
          const data = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ja&dt=t&dj=1&q=${encodeURIComponent(repliedMessage)}`)
          .then(res=>res.json())
          const translated = data.sentences.map((sentence) => {
            return sentence.trans;
          });
          const embed = new WebEmbed()
          .setColor('GREEN')
          .setDescription(`[${data.src}]->[ja]\n`)
          .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
          .setTitle(translated.join(""));

          message.channel.send({ content: `[⁠︎](${embed})` })
          .then(sentMessage => {
              message.react('⭕');
          });
        } else {
          const content = args.join(' ');
          if (!content) {
            const embed = new WebEmbed()
            .setColor('RED')
            .setDescription('テキストを入力してください')
            .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
            .setTitle('エラー');

            message.channel.send({ content: `[⁠︎](${embed})` })
            .then(sentMessage => {
                message.react('⭕');
            });
          };
          const data = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ja&dt=t&dj=1&q=${encodeURIComponent(content)}`)
          .then(res=>res.json())
          const translated = data.sentences.map((sentence) => {
            return sentence.trans;
          });
          const embed = new WebEmbed()
          .setColor('GREEN')
          .setDescription(`[${data.src}]->[ja]\n`)
          .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
          .setTitle(translated.join(""));

          message.channel.send({ content: `[⁠︎](${embed})` })
          .then(sentMessage => {
              message.react('⭕');
          });
        }
    },
};
