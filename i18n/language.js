const en_US = require("./en_US");
const it_IT = require("./it_IT");
const locatelanguage = require("locatelanguage");

module.exports = {
    i18n: () => {
        try {
            const lang = eval(locatelanguage.get());
            lang.CALL();
            return lang;
        } catch {
            console.log(2);
            console.error(en_US.WRONGLANGUAGE);
            return en_US;
        }
    }
}