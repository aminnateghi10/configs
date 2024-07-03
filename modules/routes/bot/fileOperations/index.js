const fs = require('fs');
const axios = require('axios');

async function downloadFile(url, path) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(path);
        response.data.pipe(writer);
        let error = null;
        writer.on('error', err => {
            error = err;
            writer.close();
            reject(err);
        });
        writer.on('close', () => {
            if (!error) {
                resolve(true);
            }
        });
    });
}

async function sendFileToTelegram(bot, chatId, filePath) {
    bot.sendDocument(chatId, filePath)
        .then(() => {
            console.log('File sent successfully!');
        })
        .catch(err => {
            console.error('Error while sending file:', err);
        });
}

module.exports = { downloadFile, sendFileToTelegram };
