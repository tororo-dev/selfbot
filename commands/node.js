const fs = require('fs');
const { execSync } = require('child_process');
const { WebEmbed } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'node',
    description: 'node command',
    async execute(message, args, client) {
        const userID = message.author.id;
        const config = require('../botconfig/config.json');
      
        if (userID !== config.owner && userID !== config.owner2 && userID !== config.owner3) {
            return;
        }

        if (!args[0]) {
            const embed = new WebEmbed()
            .setColor('RED')
            .setDescription('ファイル名を指定してください')
            .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
            .setTitle('エラー');
            return message.channel.send({ content: `[⁠](${embed})` });
        }

        const filename = args[0];

        if (fs.existsSync(`../files/${filename}`)) {
            try {
                const result = execSync(`node files/${filename}`, { encoding: 'utf-8' });
                await message.channel.send(`\`\`\`bash\n${result}\n\`\`\``);
            } catch (error) {
                const embed = new WebEmbed()
                .setColor('RED')
                .setDescription(`エラーが発生しました`)
                .setTitle('エラー');
                await message.channel.send({ content: `[⁠](${embed})` });
            }
        } else {
            const embed = new WebEmbed()
            .setColor('RED')
            .setDescription('指定されたファイルが見つかりません')
            .setTitle('エラー');
            return message.channel.send({ content: `[⁠](${embed})` });
        }
    }
};
