import axios from 'axios';
import * as cheerio from 'cheerio';

export async function decryptSources_v2(id, name, embed) {
    try {
        const savName = 'Stream Wish';
        const sourcesUrl = `https://deaddrive.xyz/embed/${embed}`;
        // console.log(`Fetching sources from: ${sourcesUrl}`);

        // Set the user agent
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };

        const sourcesData = await axios.get(sourcesUrl, { headers });
        // console.log(`Fetched sources data successfully`);

        const $ = cheerio.load(sourcesData.data);
        // console.log(`Sources data content: ${sourcesData.data}`);

        // Update the selector to find the linkserver element
        const linkServerElement = $('.wrapper > .videocontent > #list-server-more > .list-server-items > .linkserver')
            .filter((i, el) => $(el).text().trim() === savName);

        // console.log(`Found ${linkServerElement.length} linkServerElement(s)`);

        if (linkServerElement.length > 0) {
            const dataVideoUrl = linkServerElement.attr('data-video');
            // console.log(`Data video URL: ${dataVideoUrl}`);

            const videoPage = await axios.get(dataVideoUrl, { headers, maxRedirects: 5 });
            const videoPageContent = cheerio.load(videoPage.data);
            // console.log(videoPage.data);

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
            // All Regular Expressions
            const baseUrlRegular = /\|([^|]+)\|sources\|/;
            const draftbaseUrlRegular = /\|([^|]+)\|cdn\|/;
            const newPatternRegular = /\|kind(?:\|[^|]*)?\|(\d{5})\|(\d{2})\|/;
            const newPatternRegular3 = /\|([^|]+)\|([^|]+)\|hls2\|/;
            const langValueRegular = /\|master\|([^|]+)\|/;
            const valueBeforeM3u8Regular = /\|129600\|([^|]+(?:\|[^|]+)*)\|m3u8\|/;
            const dataValueRegular = /\|data\|([^|]+)\|/;
            const srvValueRegular = /\|srv\|([^|]+)\|/;
            const fileIdRegular = /file_id',\s*'([^']+)/;
            const cValueRegular = /ab:\[{[^]*?([0-9]+\.[0-9])&/;
            const asnValueRegular = /\|([^|]+)\|asn\|/;
            const spValueRegular = /\|([^|]+)\|sp\|/;
            const pallValueRegular = /file\|([^|]+)\|([^|]+)/;
            const cookieValueRegular = /\$.cookie\('file_id',\s*'([^']+)/;

            videoPageContent('script').each((i, script) => {
                const scriptContent = videoPageContent(script).html();

                // Match regular expressions
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
                    baseUrl = `${reversedSegments}.cdn-${draft2baseurl}.com`;

                    // console.log(`Base URL Result: ${baseUrl}`);
                }

                if (newPatternMatch) {
                    const reversebefore = `${newPatternMatch[1]}|${newPatternMatch[2]}|hls2`;
                    newPattern = reversebefore.split('|').reverse().join('/');
                    // console.log(`New Pattern Result: ${newPattern}`);
                } else {
                    const newPatternmatch2 = scriptContent.match(newPatternRegular3)
                    if (newPatternmatch2) {
                        const reversebefore2 = `${newPatternmatch2[1]}|${newPatternmatch2[2]}|hls2`;
                        newPattern = reversebefore2.split('|').reverse().join('/');
                        // console.log(`New Pattern Result: ${newPattern}`);
                    }
                }

                if (langMatch) {
                    lanmatchvaluepipe = langMatch[1];
                    // const draftlanfvalue = lanmatchvaluepipe.replace('_x', '_xt');
                    langValue = `${lanmatchvaluepipe}`;
                    // langValue = `,${lanmatchvaluepipe},lang/eng/${draftlanfvalue},.urlset`;
                    // console.log(`Lang Value Result: ${langValue}`);
                }

                if (m3u8Match) {
                    const valueBeforeM3u8pipe = m3u8Match[1];
                    const parts = valueBeforeM3u8pipe.split('|');
                    if (parts.length === 1) {
                        valueBeforeM3u8 = parts[0];
                    } else if (parts.length === 2) {
                        valueBeforeM3u8 = `${parts[1]}-${parts[0]}`;
                    }
                    // console.log(`Value Before M3U8: ${valueBeforeM3u8}`);
                }


                if (dataMatch) {
                    dataValue = dataMatch[1];
                    // console.log(`Data Value Result: ${dataValue}`);
                }

                if (srvMatch) {
                    srvValue = srvMatch[1];
                    // console.log(`SRV Value Result: ${srvValue}`);
                }

                if (fileIdMatch) {
                    fileIdValue = fileIdMatch[1];
                    // console.log(`File ID Result: ${fileIdValue}`);
                }

                if (cMatch) {
                    const fullCValue = cMatch[0];
                    // console.log(`Full C Value: ${fullCValue}`);
                    cValue = fullCValue;
                }

                if (asnMatch) {
                    asnValue = asnMatch[1];
                    // console.log(`ASN Value Result: ${asnValue}`);
                }

                if (spMatch) {
                    spValue = spMatch[1];
                    // console.log(`SP Value Result: ${spValue}`);
                }

                if (pallMatch) {
                    const firstValue = pallMatch[1];
                    const secondValue = pallMatch[2];
                    if (isNaN(firstValue)) {
                        pallValue = firstValue;
                    } else {
                        pallValue = secondValue;
                        // console.log(`FR Value Result: ${pallValue}`);
                    }
                }

                if (cookieMatch) {
                    cookieFileIdValue = cookieMatch[1];
                    // console.log(`Cookie File ID Result: ${cookieFileIdValue}`);
                }
            });

            const makeurl = `https://${baseUrl}/${newPattern}/${langValue}/master.m3u8?t=${valueBeforeM3u8}&s=${dataValue}&e=${srvValue}&f=${fileIdValue}&srv=${pallValue}&i=0.4&sp=${spValue}&p1=${pallValue}&p2=${pallValue}&asn=${asnValue}`;

            fileLink = makeurl;
            // console.log(makeurl);

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
                        throw new Error('File link returned a 404 error code');
                    }
                } catch (error) {
                    throw new Error('Error fetching file link: ' + error.message);
                }
            }
        } else {
            throw new Error('Stream wish linkserver element not found');
        }
    } catch (error) {
        console.error('Error during decryption:', error.message);
        console.error(error.stack);
    }
}
