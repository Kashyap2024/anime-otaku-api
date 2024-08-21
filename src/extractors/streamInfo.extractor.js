import axios from "axios";
import * as cheerio from "cheerio";
import baseUrl from "../utils/baseUrl.js";
import { fetchServerData_v1 } from "../parsers/idFetch_v1.parser.js";
import { fetchServerData_v2 } from "../parsers/idFetch_v2.parser.js";
import { fetchServerData_v3 } from "../parsers/idFetch_v3.parser.js";
import { decryptAllServers } from "../parsers/decryptors/decryptAllServers.decryptor.js";

async function extractOtherEpisodes(id) {
  try {
    const finalId = id
    const resp = await axios.get(`${baseUrl}/watch/${finalId}`);
    const $ = cheerio.load(resp.data);
    const elements = $(".seasons-block > #detail-ss-list > .detail-infor-content > .ss-list > a");
    
    const episodes = elements.map((index, element) => {
      const hrefdataid = $(element).attr("href").replace('/', '')
      const title = $(element).attr("title");
      const episode_no = $(element).attr("data-number");
      const data_id = $(element).attr("data-id");
      // const japanese_title = $(element).find(".ssli-detail > .ep-name").attr("data-jname");
      
      return { hrefdataid, data_id, episode_no, title };
    }).get();
    
    return episodes;
  } catch (error) {
    console.error("An error occurred:", error);
    return [];
  }
}

function isDuplicateSource(sources, newSource) {
  return sources.some(
      source => source.source === newSource.source && source.quality === newSource.quality
  );
}


async function extractStreamingInfo(id) {
  try {
    const [data_v1, data_v2, data_v3] = await Promise.all([
      fetchServerData_v1(id),
      fetchServerData_v2(id),
      fetchServerData_v3(id),
    ]);

    // Combine and sort data from all three servers
    const sortedData = [...data_v1, ...data_v2, ...data_v3].sort((a, b) => a.embed.localeCompare(b.embed));

    // Decrypt all servers' data
    const decryptedResults = await decryptAllServers(sortedData);

    // Group by server name
    const groupedResults = decryptedResults.reduce((acc, result) => {

      if (result.status === "fulfilled" && result.value && result.value.results) {
        result.value.results.forEach(item => {

          if (item.status === "fulfilled" && item.value) {
            const { server, type, source, quality } = item.value;

            if (!server) {
              console.warn("Missing server name in decrypted item:", item.value);
              return;
            }

            if (!acc[server]) {
              acc[server] = {
                server: server,
                sources: []
              };
            }

            // Check for duplicates before adding the new source
            if (!isDuplicateSource(acc[server].sources, { source, quality })) {
              acc[server].sources.push({
                type: type,
                source: source,
                quality: quality
              });
            }
          }
        });
      } else {
        console.log("Result skipped due to status or missing value:", result);
      }
      return acc;
    }, {});

    // Convert the grouped object into an array
    const groupedResultsArray = Object.values(groupedResults);

    return groupedResultsArray;
  } catch (error) {
    console.error("An error occurred:", error);
    return [];
  }
}



export { extractOtherEpisodes, extractStreamingInfo };