import axios from 'axios';

const authApi = axios.create({
    baseURL: import.meta.env.VIRE_API_URL || '/api',
    timeout: 10_000,
    withCredentials: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',

    }
});

export async function register(credentials) {
    const response = await authApi.post('/')

}