const axios = require("axios");

// Client Credentials
const clientId = "08ee07b8-5fab-4952-b645-554b85f76db2";
const clientSecret = "BBRIe09ER9HCMpo3sWzPkFM~JV";

// Token cache (simple in-memory)
let tokenCache = {
    token: null,
    expires: null
};

// Get Access Token
async function getAccessToken() {
    const now = new Date().getTime();

    if (tokenCache.token && tokenCache.expires > now) {
        return tokenCache.token;
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await axios.post(
        "https://apis.quran.foundation/oauth/token",
        "grant_type=client_credentials&scope=content",
        {
            headers: {
                "Authorization": `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
    );

    tokenCache.token = response.data.access_token;
    tokenCache.expires = now + 60 * 60 * 1000; // 1 hour
    return tokenCache.token;
}

// Fetch all chapters
async function getChapters(req, res) {
    try {
        const token = await getAccessToken();

        const response = await axios.get(
            "https://apis.quran.foundation/content/api/v4/chapters",
            {
                headers: {
                    "x-auth-token": token,
                    "x-client-id": clientId,
                    "Accept": "application/json"
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
}

// Fetch Ayahs of a Surah
async function getAyahs(req, res) {
    try {
        const { surahNumber } = req.params;
        const token = await getAccessToken();

        const response = await axios.get(
            `https://apis.quran.foundation/content/api/v4/chapters/${surahNumber}/verses`,
            {
                headers: {
                    "x-auth-token": token,
                    "x-client-id": clientId,
                    "Accept": "application/json"
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
}

// Fetch translations of a Surah
async function getTranslations(req, res) {
    try {
        const { surahNumber, language } = req.params; // en, ur, etc.
        const token = await getAccessToken();

        const response = await axios.get(
            `https://apis.quran.foundation/content/api/v4/chapters/${surahNumber}/translations/${language}`,
            {
                headers: {
                    "x-auth-token": token,
                    "x-client-id": clientId,
                    "Accept": "application/json"
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
}

// Fetch recitations of a Surah
async function getRecitation(req, res) {
    try {
        const { surahNumber, reciter } = req.params;
        const token = await getAccessToken();

        let url = `https://apis.quran.foundation/content/api/v4/chapters/${surahNumber}/recitations`;
        if (reciter) url += `/${reciter}`;

        const response = await axios.get(url, {
            headers: {
                "x-auth-token": token,
                "x-client-id": clientId,
                "Accept": "application/json"
            }
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
}

module.exports = { getChapters, getAyahs, getTranslations, getRecitation };
