import puppeteer from "puppeteer";

export const generatePdf = async (html, options): Promise<Buffer> => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ]
    });
    const page = await browser.newPage();
    await page.setContent(html, {
        waitUntil: 'networkidle0', // wait for page to load completely
    });

    const pdf = await page.pdf(options);
    await browser.close();
    return pdf;
}
