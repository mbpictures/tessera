import { PrismaClient } from "@prisma/client";

const locales = require("./locales.json");
const DEFAULT_LANG = "en";
const path = require('path');

module.exports = {
    i18n: {
        defaultLocale: DEFAULT_LANG,
        locales,
        namespaces: ["common", "information", "payment", "seatselection"],
        loadLocaleFrom: async (lang, ns) => {
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
    },
    localePath: path.resolve('./locale')
};
