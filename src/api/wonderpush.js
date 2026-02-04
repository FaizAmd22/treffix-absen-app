import axios from "axios";

const wonderpushUrl = import.meta.env.VITE_WONDERPUSH_URL;

export const APIWonder = axios.create({
    baseURL: wonderpushUrl,
});