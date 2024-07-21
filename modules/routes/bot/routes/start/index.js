const path = require('path');

const {botId} = require('../../../../../utils/message');

const logoPath = path.resolve(__dirname, '../../../../../assets/images/logo/logo.jpg');

const Start = async (msg, bot) => {
    const chatId = msg.chat.id;

    const options = {
        reply_markup: {
            keyboard: [
                ['خرید اشتراک جدید 🚀'],
                ['اشتراک های من 🔄', 'تست رایگان 🧪'],
                ['راهنمای اتصال 🔗', 'ارتباط با پشتیبانی 📞'],
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };

    try {
        await bot.sendPhoto(chatId, logoPath, {
            caption: 'سلام به ربات تاج نت خوش اومدی☺️\n' +
                '\n' +
                'با این ربات میتونی کانفیگ v2ray تهیه کنی، و بصورت کامل اکانت هات رو مدیریت کنی.ثبت سفارش کنی، حجم مصرفیت رو ببینی، اشتراکت رو تمدید کنی و…!\n' +
                '\n' +
                'پینشهاد میکنم قبل از شروع سفارش از منو زیر «دریافت اکانت تست 🧪» رو بزنی تا اگه از کیفیت سرویس ها رضایت داشتی خرید انجام بدی.\n' +
                '\n' +
                'در ضمن مجموعه تضمین بازگشت وجه داره، پس با خیال راحت سفارشت رو ثبت کن♥️' + botId,
            reply_markup: options.reply_markup
        })
    } catch (error) {
        console.error('Error sending photo or text message:', error);
    }
}

module.exports = Start;
