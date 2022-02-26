const locales = require("./locales.json");
const { PrismaClient } = require("@prisma/client");

const DEFAULT_LANG = "en";

module.exports = {
    "locales": locales,
    "defaultLocale": DEFAULT_LANG,
    "pages": {
        "*": ["common"]
    },
    "loadLocaleFrom": async (lang, ns) => {
        const prisma = new PrismaClient();
        let result = {};
        try {
            result = (await import(`./locale/${lang}/${ns}.json`)).default;
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
                .filter((translation) => translation.translations[lang])
                .reduce((result, translation) => {
                    return { ...result, [translation.key]: translation.translations[lang]};
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
