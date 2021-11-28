import axios from "axios";

export const sofortApiCall = async (url: string, data: any) => {
    return axios.post(url, data, {
        headers: {
            'Content-Type': 'text/xml'
        },
        auth: {
            username: process.env.SOFORT_USERNAME,
            password: process.env.SOFORT_API_KEY
        }
    })
};
