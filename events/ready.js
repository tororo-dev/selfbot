const { RichPresence } = require('discord.js-selfbot-v13')
const config = require('../botconfig/config.json');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        const getExtendURL = await RichPresence.getExternal(
            client,
            'bot_id',
            '',
        );
        const richPresence = new RichPresence(client)
        .setApplicationId('bot_id')
        .setType('COMPETING')
        .setName('Hello world!')
        .setDetails('しもべ | *help')
        .setStartTimestamp(Date.now())
        .setAssetsLargeImage(getExtendURL[0].external_asset_path)
        .setAssetsSmallImage('')
        .addButton('Developed by torocord', 'https://discord.com/users/1205349856219103262');

        const status = new CustomStatus(client).setEmoji('✅').setState(client.guilds.cache.size + ' servers');
        
        console.log(client.user.tag + " is online!");
        client.user.setPresence({ activities: [richPresence, status] });
    },
};
 
