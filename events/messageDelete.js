const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

module.exports = {
    name: 'messageDelete',
    execute(message, client) {
        if (message.content === "") return;
        if (message.content === null) return;
        if (message.content.startsWith('[⁠︎]')) return;
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Tokyo',
        };

        const timestamp = new Date().toLocaleString('ja-JP', options);

        console.log('Message Deleted:');
        console.log(`Time: ${timestamp}`);

        if (message.author) {
            console.log(`Author: ${message.author.tag}`);
        } else {
            console.log(`Author not available (message deleted).`);
        }

        console.log(`Content: ${message.content}`);

        console.log(`Server: ${message.guild.name} (ID: ${message.guild.id})`);
        console.log(`Channel: ${message.channel.name} (ID: ${message.channel.id})`);

        const channelHistoryDir = path.join(`./history/${message.channel.id}`);
        if (!fs.existsSync(channelHistoryDir)) {
            fs.mkdirSync(channelHistoryDir, { recursive: true });
        }
      
        let nextFileNumber = 1;
        const files = fs.readdirSync(channelHistoryDir);
        files.forEach(file => {
            const match = file.match(/^(\d+)\.txt$/);
            if (match) {
                const number = parseInt(match[1], 10);
                if (number >= nextFileNumber) {
                    nextFileNumber = number + 1;
                }
            }
        });

        const historyFilePath = path.join(channelHistoryDir, `${nextFileNumber}.txt`);

        const historyData = `deleted ${message.author ? message.author.tag : 'Unknown Author'}:\ncontent:\n${message.content}\n`;

        fs.writeFile(historyFilePath, historyData, (err) => {
            if (err) {
                console.error(chalk.red(err));
            } else {
                console.log(chalk.green(`Message history saved successfully to ${historyFilePath}.`));
            }
            console.log('----------------------------------------');
        });

        const historyListFilePath = path.join(channelHistoryDir, 'list.txt');
        const historyListData = `deleted ${message.author ? message.author.tag : 'Unknown Author'}:\ncontent:\n${message.content}\n--------------------------------------------------\n`;

        try {
            fs.appendFileSync(historyListFilePath, historyListData);
            console.log(chalk.green(`Message history list updated successfully to ${historyListFilePath}.`));
        } catch (err) {
            console.error(chalk.red(err));
        }

        console.log('----------------------------------------');
    },
};
