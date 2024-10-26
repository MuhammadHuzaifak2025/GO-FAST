import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Save token to Secure Store
const saveToken = async (key, value) => {
    await SecureStore.setItemAsync(key, value);
};

// Retrieve token from Secure Store
const getToken = async (key) => {
    return await SecureStore.getItemAsync(key);
};

const saveTokensFromCookies = async (response) => {
    const accessToken = response.headers['set-cookie']?.find(cookie => cookie.includes('access-token'));
    const refreshToken = response.headers['set-cookie']?.find(cookie => cookie.includes('refresh-token'));

    if (refreshToken) {
        await saveToken('refreshToken', refreshToken.split(';')[0].split('=')[1]);
    }

    if (accessToken) {
        await saveToken('accessToken', accessToken.split(';')[0].split('=')[1]);
    }
    console.log(refreshToken, accessToken);
};
const setAuthHeaders = async (axios) => {
    const accessToken = await getToken('accessToken');
    const refreshToken = await getToken('refreshToken');

    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    axios.defaults.headers.common['x-refresh-token'] = refreshToken;
    console.log(axios.defaults.headers.common);
};
export { saveToken, getToken, saveTokensFromCookies, setAuthHeaders };