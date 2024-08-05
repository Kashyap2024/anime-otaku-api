import axios from "axios";
import * as cheerio from "cheerio";
import { v2_base_url } from "../utils/base_v2.js";

export async function fetchServerData_v3(id) {
  try {
    const url = await axios.get(`https://${v2_base_url}/watch/${id}`);
    const $ = cheerio.load(url.data);

    const serverData = $("div.ps_-block > div.ps__-list > div.item")
      .filter((_, ele) => {
        const name = $(ele).find("a.btn").text();
        return name;
      })
      .map((_, ele) => ({
        name: $(ele).find("a.btn").text(),
        embed: $(ele).attr("data-embed"),
        // type: $(ele).attr("data-type"),
      }))
      .get();
 
    return serverData;
  } catch (error) {
    console.error("Error fetching server data:", error);
    return [];
  }
}
