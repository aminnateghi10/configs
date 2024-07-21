const fs = require('fs');
const callBotApi = require('../../../../helpers/callBotApi');

async function loginVpnPanel() {

    try {
        const username = process.env.BOT_USER_NAME;
        const password = process.env.BOT_USER_PASS;
        let res = await callBotApi().post('/login', {username, password});
        let xuiCookie = res.headers['set-cookie'][0];
        fs.writeFileSync('botLoginCookie.txt', xuiCookie, 'utf8');
        console.log('File has been written successfully');
    } catch (err) {
        console.log('this err',err)
    }



}

async function getLoginCookie() {
    return fs.readFileSync('botLoginCookie.txt', 'utf8');
}

module.exports = {loginVpnPanel, getLoginCookie};
