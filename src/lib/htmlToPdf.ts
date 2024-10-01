import puppeteer from "puppeteer";
import ps from "ps-node-promise-es6";
import _ from "lodash";

export const generatePdf = async (html, options): Promise<Buffer> => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ]
    });
    //const browserPID = browser.process().pid;
    const page = await browser.newPage();

    let pdf;
    try {
        await page.setContent(html, {
            waitUntil: 'domcontentloaded', // wait for page to load completely
        });
        pdf = await page.pdf(options);
    } catch (e) {
        throw new Error(e);
    } finally {
        await page.close();
        await browser.close();
        //await killPID(browserPID);
    }
    return pdf;
}

const killPID = async (pid: number) => {
    const psLookup = await ps.lookup({ pid: pid });
    for (let proc of psLookup) {
        if (_.has(proc, 'pid')) {
            console.log(`Killing: ${proc.pid}`)
            await ps.kill(proc.pid, 'SIGKILL');
        }
    }
}
