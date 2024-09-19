const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

module.exports = {
    name: 'messageUpdate',
    execute(oldMessage, newMessage, client) {
        if (newMessage.content === "") return;
        if (newMessage.content === null) return;
        if (newMessage.content.startsWith('[⁠︎]')) return;
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

        console.log('Message Updated:');
        console.log(`Time: ${timestamp}`);

        if (newMessage.author) {
            console.log(`Author: ${newMessage.author.tag}`);
        } else {
            console.log('Author: Unknown (User not found)');
        }

        console.log(`Old Content: ${oldMessage.content}`);
        console.log(`New Content: ${newMessage.content}`);

        console.log(`Server: ${newMessage.guild.name} (ID: ${newMessage.guild.id})`);
        console.log(`Channel: ${newMessage.channel.name} (ID: ${newMessage.channel.id})`);

        const channelHistoryDir = path.join(`./history/${newMessage.channel.id}`);
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

        const historyData = `edited ${newMessage.author ? newMessage.author.tag : 'Unknown Author'}:\nold content:\n${oldMessage.content}\nnew content:\n${newMessage.content}\n`;

        fs.writeFile(historyFilePath, historyData, (err) => {
            if (err) {
                console.error(chalk.red(err));
            } else {
                console.log(chalk.green(`Message history saved successfully to ${historyFilePath}.`));
            }
            console.log('----------------------------------------');
        });

        const historyListFilePath = path.join(channelHistoryDir, 'list.txt');
        const historyListData = `edited ${newMessage.author ? newMessage.author.tag : 'Unknown Author'}:\nold content:\n${oldMessage.content}\nnew content:\n${newMessage.content}\n--------------------------------------------------\n`;

        try {
            fs.appendFileSync(historyListFilePath, historyListData);
            console.log(chalk.green(`Message history list updated successfully to ${historyListFilePath}.`));
        } catch (err) {
            console.error(chalk.red(err));
        }

        console.log('----------------------------------------');
    },
};
