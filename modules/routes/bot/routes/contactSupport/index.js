const {supportUrl} = require('../../../../../utils/message');

const ContactSupport = async (msg, bot) => {
    const chatId = msg.chat.id;

    const contactButton = {
        reply_markup: {
            inline_keyboard: [
                [{text: '✅ ارتباط مستقیم با پشتیبانی', url: supportUrl}]
            ]
        }
    };

    return bot.sendMessage(chatId, '🔗 برای ارتباط با پشتیبانی روی دکمه زیر کلیک کنید:', contactButton);
}

module.exports = ContactSupport;
