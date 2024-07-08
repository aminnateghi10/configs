const {v4: uuidv4} = require('uuid');
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const callBotApi = require('../../../../helpers/callBotApi');

const TestUser = require('../../../models/bot/testUsers');

// Path to the logo image
const logoPath = path.resolve(__dirname, '../../../../assets/images/logo/logo.jpg');

function setupMessageHandlers(bot) {
    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        console.log(`Received message from ${chatId}: ${text}`);
    });

    bot.onText(/\/start/, (msg) => {
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

        bot.sendPhoto(chatId, logoPath, {
            caption: 'سلام به ربات تاج نت خوش اومدی☺️\n' +
                '\n' +
                'با این ربات میتونی کانفیگ v2ray تهیه کنی، و بصورت کامل اکانت هات رو مدیریت کنی.ثبت سفارش کنی، حجم مصرفیت رو ببینی، اشتراکت رو تمدید کنی و…!\n' +
                '\n' +
                'پینشهاد میکنم قبل از شروع سفارش از منو زیر «دریافت اکانت تست 🧪» رو بزنی تا اگه از کیفیت سرویس ها رضایت داشتی خرید انجام بدی.\n' +
                '\n' +
                'در ضمن مجموعه تضمین بازگشت وجه داره، پس با خیال راحت سفارشت رو ثبت کن♥️',
            reply_markup: options.reply_markup
        })
            .then(() => {
            })
            .then(() => {
                console.log('Photo and text message sent successfully');
            })
            .catch((error) => {
                console.error('Error sending photo or text message:', error);
            });
    });

    bot.onText('تست رایگان 🧪', async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        let user = await TestUser.findOne({user_id: userId});
        if (!user) {
            user = new TestUser({user_id: userId});
            await user.save();

            let data = new FormData();
            data.append('id', '2');
            data.append('settings', `{"clients": [{"id": "${uuidv4()}", "email": "${userId}", "totalGB": 1073741824, "expiryTime": -86400000, "enable": true, "subId": "${uuidv4()}"}]}`);

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'http://87.107.104.44:54321/xui/inbound/addClient',
                headers: {
                    'Cookie': await fs.readFileSync('botLoginCookie.txt', 'utf8'),
                    ...data.getHeaders()
                },
                data: data
            };

            try {
                let response = await axios.request(config);
                let config2 = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: 'http://87.107.104.44:54321/xui/inbound/list',
                    headers: {
                        'Cookie': await fs.readFileSync('botLoginCookie.txt', 'utf8')
                    },
                };

                let response2 = await axios.request(config2);
                let settings = JSON.parse(response2.data.obj[1].settings);
                let useConfig = settings.clients.find(client => client.email === userId.toString());
                const codeText = `<code>http://87.107.104.44:2096/json/${useConfig?.subId}</code>`;
                bot.sendMessage(chatId, codeText, {parse_mode: 'HTML'});
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            bot.sendMessage(chatId, "شما قبلا اکانت تست دریافت نموده اید.✖️", {parse_mode: 'HTML'});
        }
    });

    bot.onText('اشتراک های من 🔄', async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        let data = new FormData();
        data.append('id', '2');
        data.append('settings', `{"clients": [{"id": "${uuidv4()}", "email": "${userId}", "totalGB": 1073741824, "expiryTime": -86400000, "enable": true, "subId": "${uuidv4()}"}]}`);

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://87.107.104.44:54321/xui/inbound/addClient',
            headers: {
                'Cookie': await fs.readFileSync('botLoginCookie.txt', 'utf8'),
                ...data.getHeaders()
            },
            data: data
        };

        try {
            let response = await axios.request(config);
            let config2 = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'http://87.107.104.44:54321/xui/inbound/list',
                headers: {
                    'Cookie': await fs.readFileSync('botLoginCookie.txt', 'utf8')
                },
            };

            let response2 = await axios.request(config2);
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
            console.error('Error:', error);
        }

    });
    bot.onText("خرید اشتراک جدید 🚀", async (msg) => {
        const chatId = msg.chat.id;

        // دکمه‌های شیشه‌ای (inline buttons)
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: 'آمریکا 🇺🇸', callback_data: 'usa_1'},
                        {text: 'هلند 🇳🇱', callback_data: 'holland'},
                    ],
                    [
                        {text: 'بستن پنل', callback_data: 'close_panel'}
                    ]
                ]
            }
        };

        // ارسال پیام با دکمه‌های شیشه‌ای
        bot.sendMessage(chatId, '💎 جهت خرید سرویس، یکی از کشور های زیر را انتخاب کنید:', options);
    });

// شنود callback query ها
    bot.on('callback_query', async (callbackQuery) => {

        const message = callbackQuery.message;
        const data = callbackQuery.data;

        if (data === 'close_panel') {
            bot.deleteMessage(message.chat.id, message.message_id)
                .then(() => {
                    bot.answerCallbackQuery(callbackQuery.id, {text: 'پنل بسته شد.'});
                })
                .catch((err) => {
                    console.error('Failed to delete message:', err);
                    bot.answerCallbackQuery(callbackQuery.id, {text: 'مشکلی در بستن پنل وجود داشت.'});
                });
        } else if (data === 'holland' || data === 'usa') {
            // نمایش دکمه‌های جدید برای انتخاب مدت زمان
            const newOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {text: 'یکماهه', callback_data: `${data}_monthly`},

                        ],
                        [
                            {text: 'برگشت', callback_data: 'back'}
                        ]
                    ]
                }
            };
            bot.editMessageText('لطفاً مدت زمان سرویس را انتخاب کنید:', {
                chat_id: message.chat.id,
                message_id: message.message_id,
                reply_markup: newOptions.reply_markup
            });
            bot.answerCallbackQuery(callbackQuery.id);
        } else if (data === 'back') {
            // نمایش دوباره دکمه‌های اولیه
            const originalOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {text: 'آمریکا 1', callback_data: 'usa'},
                            {text: 'هلند 1', callback_data: 'holland'},
                        ],
                        [
                            {text: 'بستن پنل', callback_data: 'close_panel'}
                        ]
                    ]
                }
            };
            bot.editMessageText('لطفاً یکی از سرورها را انتخاب کنید:', {
                chat_id: message.chat.id,
                message_id: message.message_id,
                reply_markup: originalOptions.reply_markup
            });
            bot.answerCallbackQuery(callbackQuery.id);
        } else if (data.endsWith('_monthly')) {
            // نمایش دکمه‌های جدید برای انتخاب حجم
            const newOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {text: '10 گیگ', callback_data: `${data}_10GB`},
                            {text: '20 گیگ', callback_data: `${data}_20GB`},
                        ],
                        [
                            {text: '30 گیگ', callback_data: `${data}_30GB`},
                            {text: '50 گیگ', callback_data: `${data}_50GB`},
                        ],
                        [
                            {text: '80 گیگ', callback_data: `${data}_80GB`},
                        ],
                        [
                            {text: 'برگشت', callback_data: data.split('_')[0]}
                        ]
                    ]
                }
            };
            bot.editMessageText('🌿 لطفا حجم سرویس را مشخص کنید:', {
                chat_id: message.chat.id,
                message_id: message.message_id,
                reply_markup: newOptions.reply_markup
            });
            bot.answerCallbackQuery(callbackQuery.id);
        } else if (data.endsWith('_10GB') || data.endsWith('_20GB')) {
            bot.sendMessage(message.chat.id, `شما بسته ${data} را انتخاب کردید.`);
            bot.answerCallbackQuery(callbackQuery.id);
        } else if (data.startsWith("subscription_status")) {
            let parts = data.split("subscription_status_");
            let email = parts[1];

            let clientTraffics = await callBotApi().get(`/xui/API/inbounds/getClientTraffics/${email}`);
            let now = new Date();
            let expiryTime = clientTraffics.data.obj.expiryTime - Date.now();
            let total = clientTraffics.data.obj.total;
            let up = clientTraffics.data.obj.up;
            let down = clientTraffics.data.obj.down;


            let traffic = ((total - up - down) / 1073741824).toFixed(0);

            let daysRemaining = Math.abs(expiryTime / 86400000);
            let hoursRemaining = Math.abs(expiryTime / 3600000);
            let minutesRemaining = Math.abs(Math.floor(expiryTime / 60000));


            console.log(expiryTime, 'expiryTimeexpiryTime333')
            if (expiryTime > 0) {
                if (daysRemaining >= 1) {
                    return bot.sendMessage(message.chat.id, `${daysRemaining.toFixed(0)} روز باقی مانده است.${traffic} گیگ از ترافیک شما باقی مانده است`);
                } else if (hoursRemaining >= 1) {
                    return bot.sendMessage(message.chat.id, `${hoursRemaining} ساعت باقی مانده است.${traffic} گیگ از ترافیک شما باقی مانده است`);
                } else {
                    return bot.sendMessage(message.chat.id, `${minutesRemaining} دقیقه باقی مانده است.${traffic} گیگ از ترافیک شما باقی مانده است`);
                }
            } else {
                return bot.sendMessage(message.chat.id, "تایم شما به اتمام رسیده است.");
            }


        }
    });

    bot.onText("ارتباط با پشتیبانی 📞", async (msg) => {
        const chatId = msg.chat.id;
        const supportUrl = 'https://t.me/goldenvpnadmin';

        const contactButton = {
            reply_markup: {
                inline_keyboard: [
                    [{text: '✅ ارتباط مستقیم با پشتیبانی', url: supportUrl}]
                ]
            }
        };

        bot.sendMessage(chatId, '🔗 برای ارتباط با پشتیبانی روی دکمه زیر کلیک کنید:', contactButton);
    });
}

module.exports = setupMessageHandlers;
