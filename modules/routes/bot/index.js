const axios = require('axios');
const FormData = require('form-data');
const { v4: uuidv4 } = require('uuid');
const TelegramBot = require('node-telegram-bot-api');

const TestUser = require('../../models/bot/testUsers');
const fs = require('fs'); // Required to read files from the file system

// Replace YOUR_TELEGRAM_BOT_TOKEN with your actual bot token
const token = '6822196437:AAF32P-MHla4SHmlTWqgOCEXjnfFoMKvzVc';
const bot = new TelegramBot(token, { polling: true });

// Bot setup and message handling
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Log message for debugging
    console.log(`Received message from ${chatId}: ${text}`);
});

// Listen for commands
// bot.onText(/\/start/, (msg) => {
//     const chatId = msg.chat.id;
//     bot.sendMessage(chatId, `شکنسمتیبکشمتسبی`);
// });
// Command to send a photo and a text message
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
    bot.sendPhoto(chatId, photoPath, { caption: 'Here is your photo!' })
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

function findUserByEmail(data,email) {
    return data.find(user => user.email === email.toString());
}
fs.writeFile('botLoginCookie.txt', 'data', 'utf8', (err) => {
    if (err) {
        console.error('Error writing to file', err);
    } else {
        console.log('File has been written successfully');
    }
});


bot.onText('اکانت تست', async (msg) => {
    const chatId = msg.chat.id;
    const userId= msg.from.id;
    let user = await TestUser.findOne({ user_id: userId });
    if (!user) {
        // افزودن کاربر جدید به پایگاه داده
        user = new TestUser({ user_id: userId });
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
                'Cookie': 'lang=fa-IR; x-ui=MTcxOTg0OTQxM3xEWDhFQVFMX2dBQUJFQUVRQUFCbF80QUFBUVp6ZEhKcGJtY01EQUFLVEU5SFNVNWZWVk5GVWhoNExYVnBMMlJoZEdGaVlYTmxMMjF2WkdWc0xsVnpaWExfZ1FNQkFRUlZjMlZ5QWYtQ0FBRURBUUpKWkFFRUFBRUlWWE5sY201aGJXVUJEQUFCQ0ZCaGMzTjNiM0prQVF3QUFBQWFfNElYQVFJQkNEQXpXVkZ4TURGQkFRaDZMMGhPU2xCa1RnQT183HAXJomk2KUsg7x55vQburN2UWcVbwccLhURVs6cxv0=',
                ...data.getHeaders()
            },
            data : data
        };

        axios.request(config)
            .then(async (response) => {

                console.log(response,'response')

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
                       let settings  = await JSON.parse(mydata.obj[1].settings);

                        let useConfig = await findUserByEmail(settings.clients,userId);
                        const codeText = `<code>http://87.107.104.44:2096/json/${useConfig?.subId}</code>`;
                        bot.sendMessage(chatId, codeText, { parse_mode: 'HTML' });

                    })
                    .catch((error) => {
                        console.log(error)
                    });
            })
            .catch((error) => {
                console.log(error);
            });

    } else {
        bot.sendMessage(chatId, '<code>You have already requested a test account.</code>', { parse_mode: 'HTML' });
    }
});


// Export a middleware function
module.exports = () => (req, res, next) => {
    // Log incoming requests
    console.log(`Incoming request to: ${req.path}`);
    // Proceed to the next middleware or route handler
    next();
};
