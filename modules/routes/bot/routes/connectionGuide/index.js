const {botId} = require("../../../../../utils/message");
const ConnectionGuide = async (msg, bot) => {
    const chatId = msg.chat.id;
    const contactButton = {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: 'آی او اس 📱', callback_data: `_10GB`},
                    {text: 'اندروید 🤖', callback_data: `_10GB`}
                ],
                [
                    {text: 'مک 🖥', callback_data: `_10GB`},
                    {text: 'ویندوز 💻', callback_data: `_10GB`}
                ],
                [
                    {text: '❌ بستن ❌', callback_data: 'close_panel'}
                ]
            ]
        }
    };

    return bot.sendMessage(chatId, '🔗 شما میتوانید برای راهنمای اتصال به اشتراک کانال رسمی ما را دنبال کنید و همچنین از دکمه های زیر میتوانید برنامه های مورد نیاز هر سیستم عامل را دانلود کنید.' + botId, contactButton);
}

module.exports = ConnectionGuide;
