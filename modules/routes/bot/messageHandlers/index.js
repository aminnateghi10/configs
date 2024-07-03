const { v4: uuidv4 } = require('uuid');
const FormData = require('form-data');
const axios = require('axios');
const TestUser = require('../../../models/bot/testUsers');

function setupMessageHandlers(bot) {
    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        console.log(`Received message from ${chatId}: ${text}`);
    });

    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const photoPath = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRA5WuFnVLiw0Tr5XCEbttBaVTZRpFTmY6q7A&s';
        const options = {
            reply_markup: {
                keyboard: [
                    ['سرویس ها', 'خرید سرویس'],
                    ['اکانت تست']
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        };

        bot.sendPhoto(chatId, photoPath, { caption: 'Here is your photo!' })
            .then(() => bot.sendMessage(chatId, 'This is the accompanying text message.', options))
            .then(() => {
                console.log('Photo and text message sent successfully');
            })
            .catch((error) => {
                console.error('Error sending photo or text message:', error);
            });
    });

    bot.onText(/اکانت تست/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        let user = await TestUser.findOne({ user_id: userId });
        if (!user) {
            user = new TestUser({ user_id: userId });
            await user.save();

            let data = new FormData();
            data.append('id', '2');
            data.append('settings', `{"clients": [{"id": "${uuidv4()}", "email": "${userId}", "totalGB": 1073741824, "expiryTime": -86400000, "enable": true, "subId": "${uuidv4()}"}]}`);

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'http://87.107.104.44:54321/xui/inbound/addClient',
                headers: {
                    'Cookie': await getLoginCookie(),
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
                        'Cookie': await getLoginCookie()
                    },
                };

                let response2 = await axios.request(config2);
                let settings = JSON.parse(response2.data.obj[1].settings);
                let useConfig = settings.clients.find(client => client.email === userId.toString());
                const codeText = `<code>http://87.107.104.44:2096/json/${useConfig?.subId}</code>`;
                bot.sendMessage(chatId, codeText, { parse_mode: 'HTML' });
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            bot.sendMessage(chatId, '<code>You have already requested a test account.</code>', { parse_mode: 'HTML' });
        }
    });
}

module.exports = setupMessageHandlers;
