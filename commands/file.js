const fs = require('fs');
const { WebEmbed } = require('discord.js-selfbot-v13');

let editingFiles = {};

module.exports = {
    name: 'file',
    description: 'file command',
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

        if (fs.existsSync(filename)) {
            const content = fs.readFileSync(`../files/${filename}`, 'utf8');
            await message.channel.send(`\`\`\`\n${content}\n\`\`\``);
            editingFiles[message.author.id] = filename;
            await message.channel.send('ファイル内容を送信してください');
        } else {
            fs.writeFileSync(`../files/${filename}`, '');
            editingFiles[message.author.id] = filename;
            await message.channel.send('ファイル内容を送信してください');
        }
    }
};

client.on('messageCreate', async (message) => {
    const userID = message.author.id;

    if (editingFiles[userID]) {
        const filename = editingFiles[userID];
        fs.writeFileSync(`../files/${filename}`, message.content);
        await message.channel.send(`${filename}が更新されました`);
        delete editingFiles[userID];
    }
});
