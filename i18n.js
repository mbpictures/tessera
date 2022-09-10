const locales = require("./locales.json");
const { PrismaClient } = require("@prisma/client");

const DEFAULT_LANG = "en";

module.exports = {
    "loader": false,
    "locales": locales,
    "defaultLocale": DEFAULT_LANG,
    "pages": {
        "*": ["common"],
        "/information": ["information"],
        "/payment": ["payment"],
        "/seatselection/[id]": ["seatselection"],
        "/checkout": ["checkout"]
    },
    "logger": () => {},
    "logBuild": false,
    "loadLocaleFrom": async (lang, ns) => {
        const prisma = new PrismaClient();
        let result = (await import(`./locale/${DEFAULT_LANG}/${ns}.json`)).default;
        try {
            result = {...result , ...(await import(`./locale/${lang}/${ns}.json`)).default};
        } catch (e) {
            throw e;
        }
        try {
            const translations = await prisma.translation.findMany({
                where: {
                    namespace: ns
                }
            });
            const db = translations
                .filter((translation) => JSON.parse(translation.translations)[lang])
                .reduce((result, translation) => {
                    return { ...result, [translation.key]: JSON.parse(translation.translations)[lang]};
                }, {});
            result = { ...result, ...db }; // override locales by database
        } catch (e) {
            throw e
        } finally {
            prisma.$disconnect();
        }
        return result;
    }
}
