require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const {v4: uuidv4} = require('uuid');
const FormData = require('form-data');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const TestUser = require('../../models/bot/testUsers');
const callBotApi = require("../../../helpers/callBotApi");
// Connect telegram bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

// Login vpn panel
(async () => {
    const username = process.env.BOT_USER_NAME;
    const password = process.env.BOT_USER_PASS;
    let res = await callBotApi().post('/login', {username, password});
    let xuiCookie = res.headers['set-cookie'][0];
    fs.writeFile('botLoginCookie.txt', xuiCookie, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file', err);
        } else {
            console.log('File has been written successfully');
        }
    });
})();


// Bot setup and message handling
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    // Log message for debugging
    console.log(`Received message from ${chatId}: ${text}`);
});


const fileUrl = 'https://goldenv.bbbbbsdf.cfd/sd-jklad-mcs-sasdew/server/getDb';
const filePath = path.resolve(__dirname, 'database.db');

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

async function sendFileToTelegram(filePath) {
    bot.sendDocument('6083550027', filePath)
        .then(() => {
            console.log('File sent successfully!');
        })
        .catch(err => {
            console.error('Error while sending file:', err);
        });
}

async function main() {
    try {
        await downloadFile(fileUrl, filePath);
        console.log('File downloaded successfully!');
        await sendFileToTelegram(filePath);
    } catch (err) {
        console.error('Error:', err);
    }
}

main();



bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const photoPath = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRA5WuFnVLiw0Tr5XCEbttBaVTZRpFTmY6q7A&s'; // Replace with the actual path to your photo


    // تنظیمات دکمه‌های شیشه‌ای
    // const options = {
    //     caption: 'Here is your photo!',
    //     reply_markup: {
    //         inline_keyboard: [
    //             [
    //                 {
    //                     text: 'Button 1',
    //                     callback_data: 'button1'
    //                 },
    //                 {
    //                     text: 'Button 2',
    //                     callback_data: 'button2'
    //                 }
    //             ],
    //             [
    //                 {
    //                     text: 'Button 3',
    //                     callback_data: 'button3'
    //                 }
    //             ]
    //         ]
    //     }
    // };



    const options = {
        reply_markup: {
            keyboard: [
                ['سرویس ها', 'خرید سرویس'], // دکمه‌ها در یک ردیف
                ['اکانت تست'], // دکمه‌ها در ردیف دیگر
            ],
            resize_keyboard: true, // تغییر اندازه خودکار کیبورد
            one_time_keyboard: true // کیبورد بعد از استفاده مخفی شود
        }
    };

    // Send a photo from the file system with a caption
    bot.sendPhoto(chatId, photoPath, {caption: 'Here is your photo!'})
        .then(() => {
            // After sending the photo, send a text message
            return bot.sendMessage(chatId, 'This is the accompanying text message.', options);
        })
        .then(() => {
            console.log('Photo and text message sent successfully');
        })
        .catch((error) => {
            console.error('Error sending photo or text message:', error);
        });
});

function findUserByEmail(data, email) {
    return data.find(user => user.email === email.toString());
}


bot.onText('اکانت تست', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    let user = await TestUser.findOne({user_id: userId});
    if (!user) {
        // افزودن کاربر جدید به پایگاه داده
        user = new TestUser({user_id: userId});
        await user.save();

        let data = new FormData();
        data.append('id', '2');
        data.append('settings', `{"clients": [{
  "id": "${uuidv4()}",
  "flow": "",
  "email":"${userId}",
  "totalGB": 1073741824,
  "expiryTime": -86400000,
  "enable": true,
  "tgId": "",
  "subId": "${uuidv4()}",
  "reset": 0
}]}`);

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://87.107.104.44:54321/xui/inbound/addClient',
            headers: {
                'Cookie': 'x-ui=MTcxOTkzNzk1MXxEWDhFQVFMX2dBQUJFQUVRQUFCbF80QUFBUVp6ZEhKcGJtY01EQUFLVEU5SFNVNWZWVk5GVWhoNExYVnBMMlJoZEdGaVlYTmxMMjF2WkdWc0xsVnpaWExfZ1FNQkFRUlZjMlZ5QWYtQ0FBRURBUUpKWkFFRUFBRUlWWE5sY201aGJXVUJEQUFCQ0ZCaGMzTjNiM0prQVF3QUFBQWFfNElYQVFJQkNEQXpXVkZ4TURGQkFRaDZMMGhPU2xCa1RnQT18YCavSbfq4fsjNNl5s60hQyyyafMRlOqmULWjhOk1D6Y=; Path=/; Expires=Thu, 01 Aug 2024 16:32:31 GMT; Max-Age=2592000',
                ...data.getHeaders()
            },
            data: data
        };

        axios.request(config)
            .then(async (response) => {

                console.log(response, 'response')

                let config2 = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: 'http://87.107.104.44:54321/xui/inbound/list',
                    headers: {
                        'Cookie': 'lang=fa-IR; x-ui=MTcxOTg0OTQxM3xEWDhFQVFMX2dBQUJFQUVRQUFCbF80QUFBUVp6ZEhKcGJtY01EQUFLVEU5SFNVNWZWVk5GVWhoNExYVnBMMlJoZEdGaVlYTmxMMjF2WkdWc0xsVnpaWExfZ1FNQkFRUlZjMlZ5QWYtQ0FBRURBUUpKWkFFRUFBRUlWWE5sY201aGJXVUJEQUFCQ0ZCaGMzTjNiM0prQVF3QUFBQWFfNElYQVFJQkNEQXpXVkZ4TURGQkFRaDZMMGhPU2xCa1RnQT183HAXJomk2KUsg7x55vQburN2UWcVbwccLhURVs6cxv0='
                    },
                };

                axios.request(config2)
                    .then(async (response) => {
                        let mydata = await response.data;
                        // let mydata2 = await JSON.stringify(mydata);
                        let settings = await JSON.parse(mydata.obj[1].settings);

                        let useConfig = await findUserByEmail(settings.clients, userId);
                        const codeText = `<code>http://87.107.104.44:2096/json/${useConfig?.subId}</code>`;
                        bot.sendMessage(chatId, codeText, {parse_mode: 'HTML'});

                    })
                    .catch((error) => {
                        console.log(error)
                    });
            })
            .catch((error) => {
                console.log(error);
            });

    } else {
        bot.sendMessage(chatId, '<code>You have already requested a test account.</code>', {parse_mode: 'HTML'});
    }
});


// Export a middleware function
module.exports = () => (req, res, next) => {
    // Log incoming requests
    console.log(`Incoming request to: ${req.path}`);
    // Proceed to the next middleware or route handler
    next();
};
