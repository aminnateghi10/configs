const fs = require('fs');
const axios = require('axios');

const callBotApi = () => {
    const axiosInstance = axios.create({
        baseURL: 'https://cruisevpn.bbbbbsdf.cfd/sd-jkgsfdsd-asdfs-sasfhaw/'
    });

    axiosInstance.interceptors.request.use(
        async (config) => {
            try {
                // Read the cookie file asynchronously
                const cookie = await fs.promises.readFile('botLoginCookie.txt', 'utf8');
                // Set the cookie in the headers
                config.headers.Cookie = cookie.trim(); // Assuming it's a cookie header format
            } catch (err) {
                console.error('Error reading cookie file:', err);
            }
            return config;
        },
        err => {
            throw err;
        }
    );

    axiosInstance.interceptors.response.use(
        (res) => {
            return res;
        },
        err => {
            const res = err?.response;
            throw err;
        }
    );

    return axiosInstance;
};

module.exports = callBotApi;
