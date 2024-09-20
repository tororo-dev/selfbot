const { RichPresence, CustomStatus } = require('discord.js-selfbot-v13')
const config = require('../botconfig/config.json');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        const getExtendURL = await RichPresence.getExternal(
            client,
            '1264835937767129181',
            'https://cdn.discordapp.com/app-assets/1264835937767129181/1286625549615239201.png',
        );
        const richPresence = new RichPresence(client)
        .setApplicationId('1264835937767129181')
        .setType('LISTENING')
        .setName('Hello world!')
        .setDetails('しもべ | *help')
        .setStartTimestamp(Date.now())
        .setAssetsLargeImage(getExtendURL[0].external_asset_path)
        .setAssetsSmallImage('1264839191532142656')
        .addButton('Developed by torocord', 'https://discord.com/users/1205349856219103262');

        const status = new CustomStatus(client).setEmoji('✅').setState(client.guilds.cache.size + ' servers');
        
        console.log(client.user.tag + " is online!");
        client.user.setPresence({ activities: [richPresence, status] });
    },
};
 
