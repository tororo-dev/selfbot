const fs = require('fs');
const path = require('path');
const config = require('../botconfig/config.json');
const { WebEmbed } = require('discord.js-selfbot-v13');
const fetch = require('node-fetch');
const uuid = require('uuid');

const headers = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "ja,en-US;q=0.9,en;q=0.8",
    "cache-control": "no-cache",
    "content-type": "application/json",
    "pragma": "no-cache",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "referrer": "https://www.chess.com/play/computer/discord-wumpus?utm_source=chesscom&utm_medium=homepagebanner&utm_campaign=discord2024"
};

async function generatePromoAndSend(webhookUrl) {
    const offerCodeUrl = "https://www.chess.com/rpc/chesscom.partnership_offer_codes.v1.PartnershipOfferCodesService/RetrieveOfferCode";
    
    try {
        const gameListResponse = await fetch(`https://www.chess.com/service/gamelist/top?limit=50&from=${Math.floor(Math.random() * 1000)}`);
        const gameList = await gameListResponse.json();
        
        if (gameList.length > 0) {
            const firstPlayer = gameList[0].players[0];
            const userUuid = firstPlayer.uuid;

            const offerCodeResponse = await fetch(offerCodeUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    "userUuid": userUuid,
                    "campaignId": "4daf403e-66eb-11ef-96ab-ad0a069940ce"
                })
            });

            if (offerCodeResponse.ok) {
                const offerCodeData = await offerCodeResponse.json();
                const codeValue = offerCodeData.codeValue;

                if (codeValue) {
                    const promoUrl = `https://discord.com/billing/promotions/${codeValue}`;

                    await fetch(webhookUrl, {
                        method: 'POST',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ content: `<${promoUrl}>` })
                    });

                    const fileName = `${uuid.v1()}.txt`;
                    fs.appendFileSync(fileName, `${promoUrl}\n`);

                    return promoUrl;
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    name: 'promo',
    description: 'promo command',
    async execute(message, args, client) {
        const userID = message.author.id;
        if (userID !== config.owner && userID !== config.owner2 && userID !== config.owner3) {
            return;
        }

        try {
            const promoUrl = await generatePromoAndSend("YOUR_WEBHOOK_URL");
            if (promoUrl) {
                const embed = new WebEmbed()
                .setColor('GREEN')
                .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
                .setTitle('プロモーションニトロ生成');

                return message.channel.send({ content: `[⁠︎](${embed})\n${promoUrl}` })
            } else {
                throw new Error('プロモーションニトロのコードの取得に失敗しました。');
            }
        } catch (error) {
            console.error(error);
            const embed = new WebEmbed()
            .setColor('RED')
            .setDescription(`エラーが発生しました`)
            .setProvider({ name: `@${message.author.username}`, url: `https://discord.com/users/${message.author.id}` })
            .setTitle('エラー');

            return message.channel.send({ content: `[⁠︎](${embed})` })
            .then(sentMessage => {
                message.react('❌');
            });
        }
    },
};
