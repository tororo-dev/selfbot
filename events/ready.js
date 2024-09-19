const { RichPresence } = require('discord.js-selfbot-v13')
const config = require('../botconfig/config.json');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        const getExtendURL = await RichPresence.getExternal(
            client,
            '1259032519542837349',
            'https://cdn.discordapp.com/app-assets/1259032519542837349/1262247475960610867.png',
        );
        const status = new RichPresence(client)
        .setApplicationId('1259032519542837349')
        .setType('COMPETING')
        .setName(client.guilds.cache.size + 'サーバー')
        .setDetails('ぴあこーど')
        .setStartTimestamp(Date.now())
        .setAssetsLargeImage(getExtendURL[0].external_asset_path)
        .setAssetsLargeText('ぴのぴのもあそばない！')
        .setAssetsSmallImage('1262252019335434362')
        .setAssetsSmallText('ﾋﾟ')
        .addButton('めいん', 'https://discord.com/users/1205349856219103262')
        .addButton("ふぁんくらぶ┃EWPM", 'https://discord.gg/ewpm');
        
        console.log(client.user.tag + " is online!");
        
        client.user.setPresence({ activities: [status] });

        const channel = await client.channels.fetch(process.env.channel)
      
        async function bump() {
            await channel.sendSlash('302050872383242240', 'bump')
            console.log('bump!')
        }
      
        async function dissoku_up() {
            await channel.sendSlash('761562078095867916', 'dissoku up')
            console.log('dissoku up!')
        }
      
        async function up() {
            await channel.sendSlash('903541413298450462', 'up')
            console.log('up!')
        }
      
        function loop() {
            setTimeout(function () {
                bump();
                dissoku_up();
                up();
            }, 3610000);
        }

        loop();
    },
};
 
