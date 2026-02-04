import { translate } from "../utils/translate";

export const getTranslatedMonths = (language) => {
  return [
    translate('jan', language),
    translate('feb', language),
    translate('mar', language),
    translate('apr', language),
    translate('may', language),
    translate('jun', language),
    translate('jul', language),
    translate('aug', language),
    translate('sep', language),
    translate('oct', language),
    translate('nov', language),
    translate('dec', language),
  ];
};
