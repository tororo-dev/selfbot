const { WebEmbed } = require('discord.js-selfbot-v13');
const config = require('../botconfig/config.json');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        const prefix = config.prefix
        if (message.author.bot) return;
        if (!message.content.startsWith(prefix)) return;
      
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (!client.commands.has(command)) return;

        try {
            client.commands.get(command).execute(message, args, client);
        } catch (err) {
            console.error(err);
            const embed = new WebEmbed()
            .setAuthor({ name: message.author.username })
            .setColor('RED')
            .setDescription('エラーが発生しました')
            .setProvider({ name: '@torocord', url: 'https://discord.com/users/1187337651146215496' })
            .setTitle('エラー');
            message.channel.send({ content: `[⁠︎](${embed})` });
        }
    },
};