const en_US = require("./en_US");
const it_IT = require("./it_IT");

const locatelanguage = require("locatelanguage");

module.exports = {
    i18n: () => {
        try{
            return eval(locatelanguage.get());
        } catch {
            console.error(en_US.WRONGLANGUAGE);
            return en_US;
        }
    }
}