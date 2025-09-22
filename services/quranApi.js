const axios = require("axios");

const CLIENT_ID = process.env.QURAN_CLIENT_ID;
const CLIENT_SECRET = process.env.QURAN_CLIENT_SECRET;

async function getAccessToken() {
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

    try {
        const response = await axios({
            method: "post",
            url: "https://prelive-oauth2.quran.foundation/oauth2/token",
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data: "grant_type=client_credentials&scope=content",
        });

        return response.data.access_token;
    } catch (error) {
        console.error("❌ Error getting access token:", error.message);
        throw error;
    }
}

module.exports = { getAccessToken };
