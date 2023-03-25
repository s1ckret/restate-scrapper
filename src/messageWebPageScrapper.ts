import { CheerioAPI, load } from "cheerio";
import axios from "axios";

function getPostTitle(cheerio: CheerioAPI): string {
  const headerTag = cheerio("h1");
  return headerTag.first().text().trim();
}

function getImageUrls(cheerio: CheerioAPI): string[] {
  const imageTags = cheerio("img");
  return imageTags.toArray().map((img) => cheerio(img).attr("src")) as string[];
}

export async function scrapeWebpage(
  webpageUrl: string
): Promise<[string, string[]]> {
  const response = await axios.get(webpageUrl);
  const cheerio = load(response.data);
  const postTitle = getPostTitle(cheerio);
  const imageUrls = getImageUrls(cheerio);

  return [postTitle, imageUrls];
}
