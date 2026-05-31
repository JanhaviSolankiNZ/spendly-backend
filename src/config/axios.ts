import axios from "axios";

export const groqAxiosInstance = axios.create({
    baseURL: process.env.GROQ_API_ENDPOINT,
    headers:{
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
    },
    timeout: 5000
})