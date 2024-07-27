const fs = require('fs');
const axios = require('axios');
const {v4: uuidv4} = require('uuid');
const FormData = require('form-data');
const callBotApi = require('../../../../helpers/callBotApi');
const isValidIranianCardNumber = require("../../../../utils/isValidIranianCardNumber");


const {botId} = require('../../../../utils/message');
const {Transaction} = require('../../../models/bot/transactionSchema/index');
// routes
const Start = require('../routes/start');
const ConnectionGuide = require('../routes/connectionGuide');
const ContactSupport = require('../routes/contactSupport');
const FreeTest = require('../routes/freeTest');

// Chat ID of the admin
const adminChatId = '6083550027';

const locations = {
    holland: 'هلند 🇳🇱',
    usa: 'آمریکا🇺🇸',
}

function setupMessageHandlers(bot) {
    // for development
    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        console.log(`Received message from ${chatId}: ${text}`);
    });

    bot.onText('/start', (msg) => Start(msg, bot));
    bot.onText("راهنمای اتصال 🔗", (msg) => ConnectionGuide(msg, bot));
    bot.onText('تست رایگان 🧪', async (msg) => {
        const chatId = msg.chat.id;
        try {
            // بررسی اینکه کاربر قبلاً اکانت تست دریافت کرده است یا خیر
            const existingTestTransaction = await Transaction.findOne({user_id: chatId, status: 'test'});

            if (existingTestTransaction) {
                await bot.sendMessage(chatId, 'شما قبلاً یک اکانت تست رایگان دریافت کرده‌اید.');
                return;
            }

            const testTransaction = new Transaction({
                user_id: chatId,
                country: 'usa', // کشور مورد نظر برای اکانت تست رایگان
                duration: '1day', // مدت زمان اکانت تست
                volume: 1, // حجم اکانت تست به گیگابایت
                amount: 0, // مبلغ 0 برای اکانت تست
                status: 'test'
            });

            await testTransaction.save();

            // ایجاد کانفیگ برای کاربر
            let data = new FormData();
            data.append('id', '2');
            data.append('settings', `{"clients": [{"id": "${chatId}", "email": "${testTransaction.id}", "totalGB": ${1 * 1073741824}, "expiryTime": ${-86400000}, "enable": true, "subId": "${uuidv4()}"}]}`);

            let response = await callBotApi().post('/xui/inbound/addClient', data);

            let response2 = await callBotApi().post('/xui/inbound/list');
            let settings = JSON.parse(response2.data.obj[1].settings);
            let useConfig = settings.clients.find(client => client.id === testTransaction.user_id.toString());
            const codeText = `<code>http://cruisevpn.bbbbbsdf.cfd:2096/sub/adfaew3sd/${useConfig?.subId}</code>`;
            await bot.sendMessage(testTransaction.user_id, `اکانت تست رایگان شما ایجاد شد:\n\n` + codeText, {parse_mode: 'HTML'});
            await bot.sendMessage(adminChatId, `اکانت تست رایگان برای کاربر ${chatId} ایجاد شد.`);
        } catch (error) {
            console.error('Error:', error);
            await bot.sendMessage(chatId, 'مشکلی در ایجاد اکانت تست رایگان به وجود آمد.');
        }
    });
    bot.onText('ارتباط با پشتیبانی 📞', async (msg) => ContactSupport(msg, bot));

    const buySubscriptionOptions = {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: 'آمریکا 🇺🇸', callback_data: 'usa'},
                    {text: 'هلند 🇳🇱', callback_data: 'holland'},
                ],
                [
                    {text: '❌ بستن پنل ❌', callback_data: 'close_panel'}
                ]
            ]
        }
    };

    const buySubscription = async (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, '💎 جهت خرید سرویس، یکی از کشور های زیر را انتخاب کنید:' + botId, buySubscriptionOptions);
    }

    bot.onText('خرید اشتراک جدید 🚀', buySubscription);

    bot.onText('اشتراک های من 🔄', async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        try {
            let response2 = await callBotApi().get('/xui/API/inbounds/');
            console.log(response2, 'asdfasdfsdafdsd')
            let settings = JSON.parse(response2.data.obj[1].settings);
            let mySubscriptions = settings.clients.filter(client => client.id === userId.toString());
            let inline_keyboard = [];
            await mySubscriptions.forEach(subscription => {
                let buttonText = `${subscription.email} 🇺🇸`;
                let callbackData = `subscription_status_${subscription.email}`;
                inline_keyboard.push([{text: buttonText, callback_data: callbackData, data: subscription}]);
            });
            bot.sendMessage(chatId, "لطفا یکی از اشتراک های خود را انتخاب کنید:", {reply_markup: {inline_keyboard: inline_keyboard}});
        } catch (error) {
            console.error('Error:ddddd', error);
        }
    });

    bot.on('callback_query', async (callbackQuery) => {
        const message = callbackQuery.message;
        const data = callbackQuery.data;
        const chatId = message.chat.id;
        const userId = message.from.id;

        if (data === 'close_panel') {
            bot.deleteMessage(chatId, message.message_id)
                .then(() => {
                    bot.answerCallbackQuery(callbackQuery.id, {text: 'پنل بسته شد.'});
                })
                .catch((err) => {
                    console.error('Failed to delete message:', err);
                    bot.answerCallbackQuery(callbackQuery.id, {text: 'مشکلی در بستن پنل وجود داشت.'});
                });
        } else if (data === 'buySubscription') {
            bot.editMessageText("💎 جهت خرید سرویس، یکی از کشور های زیر را انتخاب کنید:" + botId, {
                chat_id: chatId,
                message_id: message.message_id,
                reply_markup: buySubscriptionOptions.reply_markup
            });
        } else if (data === 'holland' || data === 'usa') {
            const newOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {text: 'یکماهه', callback_data: `duration_1month_${data}`},
                        ],
                        [
                            {text: 'برگشت 🔙', callback_data: 'buySubscription'}
                        ]
                    ]
                }
            };
            bot.editMessageText('🌿 لطفا مدت زمان سرویس را انتخاب کنید:' + botId, {
                chat_id: chatId,
                message_id: message.message_id,
                reply_markup: newOptions.reply_markup
            });
            bot.answerCallbackQuery(callbackQuery.id);
        } else if (data.startsWith('duration_')) {
            const parts = data.split('_');
            const duration = parts[1];
            const country = parts[2];

            // Show new buttons for selecting volume
            const newOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {text: '10 گیگ', callback_data: `volume_10GB_${duration}_${country}`},
                            {text: '20 گیگ', callback_data: `volume_20GB_${duration}_${country}`},
                        ],
                        [
                            {text: '30 گیگ', callback_data: `volume_30GB_${duration}_${country}`},
                            {text: '50 گیگ', callback_data: `volume_50GB_${duration}_${country}`},
                        ],
                        [
                            {text: '80 گیگ', callback_data: `volume_80GB_${duration}_${country}`},
                        ],
                        [
                            {text: 'برگشت 🔙', callback_data: country}
                        ]
                    ]
                }
            };
            bot.editMessageText('🌿 لطفا حجم سرویس را مشخص کنید:' + botId, {
                chat_id: chatId,
                message_id: message.message_id,
                reply_markup: newOptions.reply_markup
            });
            bot.answerCallbackQuery(callbackQuery.id);
        } else if (data.startsWith('volume_')) {
            const parts = data.split('_');
            const volume = parseInt(parts[1]);
            const duration = parts[2];
            const country = parts[3];


            const amount = {
                '10': 30000,
                '20': 50000,
                '30': 70000,
                '50': 100000,
                '80': 140000,
            };

            // Save transaction
            const transaction = new Transaction({
                user_id: chatId,
                country: country,
                duration: duration,
                volume: volume,
                amount: amount[`${volume}`]
            });

            await transaction.save();

            const confirmOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {text: 'پرداخت به صورت کارت به کارت', callback_data: `pay_${transaction._id}`},
                        ],
                        [
                            {text: 'برگشت 🔙', callback_data: `duration_1month_${country}`},
                        ]
                    ]
                }
            };

            bot.editMessageText(`🔰 اشتراک شما آماده خرید است\n\n` +
                `🌿 شناسه صورتحساب: ${transaction._id}\n` +
                `📍 لوکیشن: ${locations[country]}\n` +
                `⏳ مدت زمان: 1 ماهه\n` +
                `💾 حجم سرویس: ${volume} گیگ (مصرف منصفانه)\n` +
                `💰 قیمت: ${amount[volume]} تومان\n\n` +
                `📌 برای پرداخت روی دکمه زیر کلیک کنید و شماره کارت خود را وارد کنید.` +
                `\n\n 🔧 در صورت هرگونه سوال یا نیاز به راهنمایی، با ما تماس بگیرید:` +
                `\n@cruise_vpn_support` + botId, {
                chat_id: chatId,
                message_id: message.message_id,
                reply_markup: confirmOptions.reply_markup
            });

            bot.answerCallbackQuery(callbackQuery.id);
        } else if (data.startsWith('pay_')) {
            const transactionId = data.split('_')[1];
            const transaction = await Transaction.findById(transactionId);


            if (transaction) {
                let cardNumber = '';
                do {
                    await bot.sendMessage(chatId, '✍️ لطفا شماره کارت مبدا را بدون فاصله وارد کنید.\n' + botId)
                        .then(() => {
                            return new Promise((resolve) => {
                                bot.once('message', async (msg) => {
                                    cardNumber = msg.text;
                                    if (!isValidIranianCardNumber(cardNumber)) {
                                        await bot.sendMessage(chatId, 'شماره کارت نامعتبر است. لطفا مجددا شماره کارت مبدا را وارد کنید.');
                                    }
                                    resolve();
                                });
                            });
                        });
                } while (!isValidIranianCardNumber(cardNumber));

                transaction.card_number = cardNumber;
                await transaction.save();

                // ارسال پیام به ادمین برای تایید تراکنش
                const adminOptions = {
                    reply_markup: {
                        inline_keyboard: [
                            [{text: 'تایید', callback_data: `confirm_${transaction._id}`}]
                        ]
                    }
                };

                await bot.sendMessage(adminChatId, `تراکنش جدید:\nشناسه: ${transaction._id}\nکشور: ${transaction.country}\nمدت زمان: ${transaction.duration}\nحجم: ${transaction.volume} گیگ\nمبلغ: ${transaction.amount} تومان\nشماره کارت: ${cardNumber}`, adminOptions);

                await bot.sendMessage(chatId, `❇️ کاربر گرامی لطفا مبلغ ${transaction.amount} تومان را به شماره کارت زیر واریز کنید.
` +
                    '\n' +
                    '‏💳  5022291537279448\n' +
                    '✏️ به نام امیرحسین عیسی پور\n' +
                    '\n' +
                    '⚠️ توجه: لطفاً مبلغ واریزی خود را دقیقاً مطابق با مبلغ فاکتور انجام دهید.\n' +
                    '\n' +
                    '🟢 پرداخت شما حداکثر تا 12 ساعت بعد از ارسال وجه تایید خواهد شد\n' +
                    '\n' +
                    '🔵 اگر هنگام کارت به کارت با خطا "کارت مقصد مسدود میباشد" و یا از این قبیل پیام ها دریافت کردید شما با همراه بانک و یا عابربانک اقدام نمایید. همچنین گفتنی است شما میتوانید با استفاده از حواله حساب به حساب و یا پل بدون محدودیت انتقال وجه انجام دهید.\n' +
                    '\n' +
                    '🔧 در صورت هرگونه سوال یا نیاز به راهنمایی، با ما تماس بگیرید: @cruise_vpn_support\n' + botId);
            } else {
                await bot.sendMessage(chatId, 'تراکنش مورد نظر پیدا نشد.');
            }
        } else if (data.startsWith('confirm_')) {
            const transactionId = data.split('_')[1];
            const transaction = await Transaction.findById(transactionId);


            console.log(transaction, 'transactiontransaction')
            if (transaction) {
                transaction.status = 'paid';
                await transaction.save();

                // ایجاد کانفیگ برای کاربر
                let data = new FormData();
                data.append('id', '2');
                data.append('settings', `{"clients": [{"id": "${chatId}", "email": "${transaction.id}", "totalGB": ${transaction.volume * 1073741824}, "expiryTime": ${transaction.duration === '1month' ? -17280000000 : -17280000000}, "enable": true, "subId": "${uuidv4()}"}]}`);

                try {
                    let response = await callBotApi().post('/xui/inbound/addClient', data);
                    let response2 = await callBotApi().post('/xui/inbound/list');
                    let settings = JSON.parse(response2.data.obj[1].settings);
                    let useConfig = settings.clients.find(client => client.email === transaction.user_id.toString());
                    const codeText = `<code>http://87.107.104.44:2096/json/${useConfig?.subId}</code>`;
                    await bot.sendMessage(transaction.user_id, codeText, {parse_mode: 'HTML'});
                    await bot.sendMessage(adminChatId, 'تراکنش تایید شد و کانفیگ به کاربر ارسال شد.');
                } catch (error) {
                    console.error('Error:', error);
                }
            } else {
                await bot.sendMessage(adminChatId, 'تراکنش مورد نظر پیدا نشد.');
            }
        } else if (data.startsWith("subscription_status")) {

            let parts = data.split("subscription_status_");
            let email = parts[1];

//
            let clientTraffics = await callBotApi().get(`/xui/API/inbounds/getClientTraffics/${email}`);
            console.log(clientTraffics, 'clientTraffics')
            let now = new Date();
            let expiryTime = clientTraffics.data.obj.expiryTime - Date.now();
            let total = clientTraffics.data.obj.total;
            let up = clientTraffics.data.obj.up;
            let down = clientTraffics.data.obj.down;


            let traffic = ((total - up - down) / 1073741824).toFixed(0);
            let totalTraffic = (total / 1073741824).toFixed(0);

            let daysRemaining = Math.abs(expiryTime / 86400000);
            let hoursRemaining = Math.abs(expiryTime / 3600000);
            let minutesRemaining = Math.abs(Math.floor(expiryTime / 60000));


            console.log(clientTraffics?.data.obj?.email, 'clientTraffics');
            let getExpiryTime = () => {
                if (expiryTime > 0) {
                    if (daysRemaining >= 1) {
                        return `${daysRemaining.toFixed(0)} روز`
                    } else if (hoursRemaining >= 1) {
                        return `${hoursRemaining.toFixed(0)} ساعت`
                    } else {
                        return `${minutesRemaining.toFixed(0)} دقیقه`
                    }
                } else {
                    return "تایم شما به اتمام رسیده است."
                }
            }


            const newOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {text: 'برگشت 🔙', callback_data: 'My_subscriptions'}
                        ]
                    ]
                }
            };


            // let config2 = {
            //     method: 'post',
            //     maxBodyLength: Infinity,
            //     url: '/xui/inbound/list',
            // };


            let response2 = await callBotApi().post('/xui/inbound/list');
            let settings = JSON.parse(response2.data.obj[1].settings);
            let useConfig = settings.clients.find(client => client.id === message.chat.id.toString());
            const codeText = `<code>http://cruisevpn.bbbbbsdf.cfd:2096/sub/adfaew3sd/${useConfig?.subId}</code>`;

            bot.editMessageText(`🌿 نام سرویس: ${clientTraffics.data.obj?.email}
‏🇺🇳 لوکیشن: ‌‏🇳🇱 هلند
💹 وضعیت: ${clientTraffics.data.obj.enable ? 'فعال' : 'غیر فعال'}
⏳ اعتبار:${getExpiryTime()}
📊 حجم کل: ${traffic} گیگابایت
💾 حجم  باقی مانده: ${totalTraffic} گیگ

📌 لینک اتصال شما (برای کپی روی لینک لمس کنید)\n\n` + codeText, {
                chat_id: message.chat.id,
                message_id: message.message_id,
                reply_markup: newOptions.reply_markup,
                parse_mode: 'HTML'
            })
        } else if (data === 'My_subscriptions') {
            const chatId = message.chat.id;
            const userId = message.from.id;

            console.log(userId, chatId, 'chhhhhhasdlas')

            try {
                let response2 = await callBotApi().get('/xui/API/inbounds/');
                console.log(response2, 'asdfasdfsdafdsd')
                let settings = JSON.parse(response2.data.obj[1].settings);

                console.log(settings, 'settingssettings')
                let mySubscriptions = settings.clients.filter(client => client.id === chatId.toString());
                console.log(mySubscriptions, 'mySubscriptions')
                let inline_keyboard = [];
                await mySubscriptions.forEach(subscription => {
                    let buttonText = `${subscription.email} 🇺🇸`;
                    let callbackData = `subscription_status_${subscription.email}`;
                    inline_keyboard.push([{text: buttonText, callback_data: callbackData, data: subscription}]);
                });

                bot.editMessageText("لطفا یکی از اشتراک های خود را انتخاب کنید:", {
                    chat_id: message.chat.id,
                    message_id: message.message_id,
                    reply_markup: {inline_keyboard: inline_keyboard}
                });
                // bot.sendMessage(chatId, , {reply_markup: });
            } catch (error) {
                console.error('Error:ddddd', error);
            }
        }

    });


}

module.exports = setupMessageHandlers;
