const { v4: uuidv4 } = require("uuid");
const FormData = require("form-data");
const TestUser = require("../../../../models/bot/testUsers");
const callBotApi = require("../../../../../helpers/callBotApi");

const createTestUser = async (userId) => {
    const user = new TestUser({ user_id: userId });
    await user.save();
    return user;
};

const generateClientSettings = (userId) => {
    return {
        id: "2",
        settings: JSON.stringify({
            clients: [
                {
                    id: uuidv4(),
                    email: userId.toString(),
                    totalGB: 1073741824,
                    expiryTime: -86400000,
                    enable: true,
                    subId: uuidv4()
                }
            ]
        })
    };
};

const addClientToServer = async (data) => {
    const api = callBotApi();
    await api.post("/xui/inbound/addClient", data);
    const list = await api.post("/xui/inbound/list");
    return list.data.obj[1];
};

const sendAccountInfo = (bot, chatId, subId) => {
    const codeText = `<code>http://goldenv.bbbbbsdf.cfd:8080/sub/${subId}</code>`;
    return bot.sendMessage(chatId, codeText, { parse_mode: "HTML" });
};

const FreeTest = async (msg, bot) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
        let user = await TestUser.findOne({ user_id: userId });

        if (!user) {
            user = await createTestUser(userId);

            const { id, settings } = generateClientSettings(userId);
            let data = new FormData();
            data.append('id', id);
            data.append('settings', settings);

            const serverConfig = await addClientToServer(data);
            const settingsObj = JSON.parse(serverConfig.settings);
            const useConfig = settingsObj.clients.find(client => client.email === userId.toString());

            if (useConfig) {
                await sendAccountInfo(bot, chatId, useConfig.subId);
            }
        } else {
            await bot.sendMessage(chatId, "شما قبلا اکانت تست دریافت نموده اید.✖️", { parse_mode: "HTML" });
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

module.exports = FreeTest;
