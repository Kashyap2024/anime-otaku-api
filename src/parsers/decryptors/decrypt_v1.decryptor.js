import puppeteer from 'puppeteer-core';
import chromium from 'chrome-aws-lambda';
import axios from 'axios';
import cheerio from 'cheerio';

export async function decryptSources_v1(id, name, embed) {
    const savName = 'VidHide';
    const sourcesUrl = `https://deaddrive.xyz/embed/${embed}`;

    let browser = null;

    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        const page = await browser.newPage();

        // Set the user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        await page.goto(sourcesUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });

        const content = await page.content();
        const $ = cheerio.load(content);

        const linkServerElement = $('.wrapper > .videocontent > #list-server-more > .list-server-items > .linkserver')
            .filter((i, el) => $(el).text().trim() === savName);

        if (linkServerElement.length > 0) {
            const dataVideoUrl = linkServerElement.attr('data-video');
            await page.goto(dataVideoUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });

            const videoPageContent = cheerio.load(await page.content());

            let fileLink = '';
            let baseUrl = '';
            let newPattern = '';
            let langValue = '';
            let valueBeforeM3u8 = '';
            let dataValue = '';
            let srvValue = '';
            let fileIdValue = '';
            let cValue = '';
            let asnValue = '';
            let spValue = '';
            let pallValue = '';
            let cookieFileIdValue = '';
            let lanmatchvaluepipe = '';

            const baseUrlRegular = /\|([^|]+)\|sources\|/;
            const draftbaseUrlRegular = /\|([^|]*cdn[^|]*)\|/;
            const newPatternRegular = /\|kind(?:\|[^|]*)?\|(\d{5})\|(\d{2})\|/;
            const langValueRegular = /\|master\|([^|]+)\|/;
            const valueBeforeM3u8Regular = /\|129600\|([^|]+(?:\|[^|]+)*)\|m3u8\|/;
            const dataValueRegular = /\|data\|([^|]+)\|/;
            const srvValueRegular = /\|srv\|([^|]+)\|/;
            const fileIdRegular = /file_id',\s*'([^']+)/;
            const cValueRegular = /ab:\[{[^]*?([0-9]+\.[0-9])&/;
            const asnValueRegular = /\|text\|([^|]+)\|/;
            const spValueRegular = /\|([^|]+)\|sp\|/;
            const pallValueRegular = /\|file\|([^|]+)\|/;
            const cookieValueRegular = /\$.cookie\('file_id',\s*'([^']+)/;

            videoPageContent('script').each((i, script) => {
                const scriptContent = videoPageContent(script).html();

                const baseMatch = scriptContent.match(baseUrlRegular);
                const draftbaseMatch = scriptContent.match(draftbaseUrlRegular);
                const newPatternMatch = scriptContent.match(newPatternRegular);
                const langMatch = scriptContent.match(langValueRegular);
                const m3u8Match = scriptContent.match(valueBeforeM3u8Regular);
                const dataMatch = scriptContent.match(dataValueRegular);
                const srvMatch = scriptContent.match(srvValueRegular);
                const fileIdMatch = scriptContent.match(fileIdRegular);
                const cMatch = scriptContent.match(cValueRegular);
                const asnMatch = scriptContent.match(asnValueRegular);
                const spMatch = scriptContent.match(spValueRegular);
                const pallMatch = scriptContent.match(pallValueRegular);
                const cookieMatch = scriptContent.match(cookieValueRegular);

                if (baseMatch) {
                    const reversedSegments = `${baseMatch[1]}`;
                    const draft2baseurl = `${draftbaseMatch[1]}`;
                    baseUrl = `${reversedSegments}.${draft2baseurl}.com`;
                }

                if (newPatternMatch) {
                    const reversebefore = `${newPatternMatch[1]}|${newPatternMatch[2]}|hls2`;
                    newPattern = reversebefore.split('|').reverse().join('/');
                }

                if (langMatch) {
                    lanmatchvaluepipe = langMatch[1];
                    langValue = `${lanmatchvaluepipe}`;
                }

                if (m3u8Match) {
                    const valueBeforeM3u8pipe = m3u8Match[1];
                    const parts = valueBeforeM3u8pipe.split('|');
                    if (parts.length === 1) {
                        valueBeforeM3u8 = parts[0];
                    } else if (parts.length === 2) {
                        valueBeforeM3u8 = `${parts[1]}-${parts[0]}`;
                    }
                }

                if (dataMatch) {
                    dataValue = dataMatch[1];
                }

                if (srvMatch) {
                    srvValue = srvMatch[1];
                }

                if (fileIdMatch) {
                    fileIdValue = fileIdMatch[1];
                }

                if (cMatch) {
                    const fullCValue = cMatch[0];
                    cValue = fullCValue;
                }

                if (asnMatch) {
                    asnValue = asnMatch[1];
                }

                if (spMatch) {
                    spValue = spMatch[1];
                }

                if (pallMatch) {
                    pallValue = pallMatch[1];
                }

                if (cookieMatch) {
                    cookieFileIdValue = cookieMatch[1];
                }
            });

            const makeurl = `https://${baseUrl}/${newPattern}/${langValue}/master.m3u8?t=${valueBeforeM3u8}&s=${dataValue}&e=${srvValue}&f=${fileIdValue}&srv=${pallValue}&i=0.4&sp=${spValue}&p1=${pallValue}&p2=${pallValue}&asn=${asnValue}`;

            fileLink = makeurl;

            if (fileLink) {
                try {
                    const response = await axios.get(fileLink);
                    if (response.status === 200) {
                        return {
                            type: embed,
                            Id: id,
                            source: fileLink,
                            server: name,
                            savName: savName,
                        };
                    } else {
                        throw new Error('File link returned a 403 error code');
                    }
                } catch (error) {
                    throw new Error('Error fetching file link: ' + error.message);
                }
            }
        } else {
            throw new Error('VidHide linkserver element not found');
        }
    } catch (error) {
        console.error('Error during decryption:', error.message);
        console.error(error.stack);
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
}

// Example usage (for testing purposes):
// (async () => {
//     const result = await decryptSources_v1('some-id', 'some-name', 'some-embed-code');
//     console.log(result);
// })();
