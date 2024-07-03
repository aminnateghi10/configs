require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const bot = require('./telegramBot');
const { loginVpnPanel, getLoginCookie } = require('./vpnPanel');
const { downloadFile, sendFileToTelegram } = require('./fileOperations');
const setupMessageHandlers = require('./messageHandlers');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = '6083550027'; // Your chat ID
const fileUrl = 'https://goldenv.bbbbbsdf.cfd/sd-jklad-mcs-sasdew/server/getDb';
const filePath = 'database.db';

(async () => {
    await loginVpnPanel();
    setupMessageHandlers(bot);
    await downloadFile(fileUrl, filePath);
    await sendFileToTelegram(bot, chatId, filePath);
})();
