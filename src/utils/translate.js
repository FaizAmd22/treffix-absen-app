import en from '../languages/en.json';
import id from '../languages/id.json';

const translations = {
    en,
    id,
};

export const translate = (key, language) => {
    return translations[language][key] || key;
};