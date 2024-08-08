import axios from 'axios';
import * as cheerio from 'cheerio';

export async function decryptSources_v3(id, name, embed) {
    try {
        const savName = 'File Moon';
        const sourcesUrl = `https://deaddrive.xyz/embed/${embed}`;
        console.log(`Fetching sources from: ${sourcesUrl}`);

        // Set the user agent
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };

        const sourcesData = await axios.get(sourcesUrl, { headers });
        console.log(`Fetched sources data successfully`);

        const $ = cheerio.load(sourcesData.data);
        console.log(`Sources data content: ${sourcesData.data}`);

        // Update the selector to find the linkserver element
        const linkServerElement = $('.wrapper > .videocontent > #list-server-more > .list-server-items > .linkserver')
            .filter((i, el) => $(el).text().trim() === savName);

        console.log(`Found ${linkServerElement.length} linkServerElement(s)`);

        if (linkServerElement.length > 0) {
            const dataVideoUrl = linkServerElement.attr('data-video');
            console.log(`Data video URL: ${dataVideoUrl}`);

            const videoPage = await axios.get(dataVideoUrl, { maxRedirects: 5 });
            const videoPageContent = cheerio.load(videoPage.data);
            console.log(videoPage.data);

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
            let frValue = '';
            let cookieFileIdValue = '';
            let lanmatchvaluepipe = '';
            // All Regular Expressions
            const baseUrlRegular = /\|com\|([^|]+(?:\|[^|]+)*)\|file\|/;
            const newPatternRegular = /\|([^|]+)\|([^|]+)\|hls2\|/;
            const langValueRegular = /\|(eng|lang)\|([^|]*_[^|]*)\|/;
            const langValueRegular2 = /\|urlset\|([^|]+)\|/;
            const valueBeforeM3u8Regular = /\|10800\|([^|]+(?:\|[^|]+)*)\|m3u8\|/;
            const dataValueRegular = /\|data\|([^|]+)\|/;
            const srvValueRegular = /\|srv\|([^|]+)\|/;
            const fileIdRegular = /file_id',\s*'([^']+)/;
            const cValueRegular = /c\.7[^]*?([0-9]{2})&/;
            const asnValueRegular = /\|([^|]+)\|asn\|/;
            const spValueRegular = /\|([^|]+)\|sp\|/;
            const frValueRegular = /\|fr\|([^|]+)\|/;
            const cookieValueRegular = /\$.cookie\('file_id',\s*'([^']+)/;
            const newLangValueRegular = /\|master\|([^|]+)\|/; // New regular expression

            videoPageContent('script').each((i, script) => {
                const scriptContent = videoPageContent(script).html();

                // Match regular expressions
                const baseMatch = scriptContent.match(baseUrlRegular);
                const newPatternMatch = scriptContent.match(newPatternRegular);
                const langMatch = scriptContent.match(langValueRegular);
                const langMatch2 = scriptContent.match(langValueRegular2);
                const m3u8Match = scriptContent.match(valueBeforeM3u8Regular);
                const dataMatch = scriptContent.match(dataValueRegular);
                const srvMatch = scriptContent.match(srvValueRegular);
                const fileIdMatch = scriptContent.match(fileIdRegular);
                const cMatch = scriptContent.match(cValueRegular);
                const asnMatch = scriptContent.match(asnValueRegular);
                const spMatch = scriptContent.match(spValueRegular);
                const frMatch = scriptContent.match(frValueRegular);
                const cookieMatch = scriptContent.match(cookieValueRegular);

                if (baseMatch) {
                    const reversedSegments = `com|${baseMatch[1]}`;
                    baseUrl = reversedSegments.split('|').reverse().join('.');
                    console.log(`Base URL Result: ${baseUrl}`);
                }

                if (newPatternMatch) {
                    const reversebefore = `${newPatternMatch[1]}|${newPatternMatch[2]}|hls2`;
                    newPattern = reversebefore.split('|').reverse().join('/');
                    console.log(`New Pattern Result: ${newPattern}`);
                }

                // Handle language value extraction
                if (langMatch) {
                    lanmatchvaluepipe = langMatch[2];
                    const lanmatchvaluepipe2 = langMatch2[1];
                    const draftlanfvalue = lanmatchvaluepipe2.replace('_hin', '').replace('_eng', '');
                    langValue = `,${lanmatchvaluepipe},lang/eng/${draftlanfvalue}_eng,.urlset`;
                    console.log(`Lang Value Result: ${langValue}`);
                } else {
                    // If langMatch is not found, use the new regular expression
                    const newLangMatch = scriptContent.match(newLangValueRegular);
                    if (newLangMatch) {
                        lanmatchvaluepipe = newLangMatch[1];
                        langValue = `${lanmatchvaluepipe}`;
                        console.log(`Lang Value Result (new regex): ${langValue}`);
                    }
                }

                if (m3u8Match) {
                    const valueBeforeM3u8pipe = m3u8Match[1];
                    const parts = valueBeforeM3u8pipe.split('|');
                    if (parts.length === 1) {
                        valueBeforeM3u8 = parts[0];
                    } else if (parts.length === 2) {
                        valueBeforeM3u8 = `${parts[1]}-${parts[0]}`;
                    }
                    console.log(`Value Before M3U8: ${valueBeforeM3u8}`);
                }

                if (dataMatch) {
                    dataValue = dataMatch[1];
                    console.log(`Data Value Result: ${dataValue}`);
                }

                if (srvMatch) {
                    srvValue = srvMatch[1];
                    console.log(`SRV Value Result: ${srvValue}`);
                }

                if (fileIdMatch) {
                    fileIdValue = fileIdMatch[1];
                    console.log(`File ID Result: ${fileIdValue}`);
                }

                if (cMatch) {
                    const fullCValue = cMatch[0];
                    console.log(`Full C Value: ${fullCValue}`);

                    // Extracting the first number that starts with two digits followed by `a-z= &`
                    const numberPattern = /[a-z]+= *(\d{2})&/;
                    const numberMatch = fullCValue.match(numberPattern);
                    if (numberMatch) {
                        cValue = numberMatch[1];
                        console.log(`C Value Result: ${cValue}`);
                    }
                }

                if (asnMatch) {
                    asnValue = asnMatch[1];
                    console.log(`ASN Value Result: ${asnValue}`);
                }

                if (spMatch) {
                    spValue = spMatch[1];
                    console.log(`SP Value Result: ${spValue}`);
                }

                if (frMatch) {
                    frValue = frMatch[1];
                    console.log(`FR Value Result: ${frValue}`);
                }

                if (cookieMatch) {
                    cookieFileIdValue = cookieMatch[1];
                    console.log(`Cookie File ID Result: ${cookieFileIdValue}`);
                }
            });

            // Construct URL
            const modifiedLangValue = lanmatchvaluepipe.replace('_h', '').replace('_x', '');
            const makeUrl = `https://${baseUrl}/${newPattern}/${langValue}/master.m3u8?t=${valueBeforeM3u8}&s=${dataValue}&e=${srvValue}&f=${fileIdValue}&srv=${cValue}&asn=${asnValue}&sp=${spValue}&fr=${modifiedLangValue}`;
            fileLink = makeUrl;
            console.log(makeUrl);

            if (fileLink) {
                        return {
                            type: embed,
                            Id: id,
                            source: fileLink,
                            server: name,
                            savName: savName,
                        };
            //     try {
            //         const response = await axios.get(fileLink);
            //         if (response.status === 200) {
            //         } else {
            //             throw new Error('File link returned a 404 error code');
            //         }
            //     } catch (error) {
            //         throw new Error('Error fetching file link: ' + error.message);
            //     }
            // }
        } else {
            throw new Error('FileMoon linkserver element not found');
        }
    } catch (error) {
        console.error('Error during decryption:', error.message);
        console.error(error.stack);
    }
}
