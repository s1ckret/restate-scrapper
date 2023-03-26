import axios, { AxiosError } from "axios";
import { sleep } from "telegram/Helpers";

export async function downloadImages(imageUrls: string[]): Promise<any[]> {
  const images = [];
  for (const imageUrl of imageUrls) {
    try {
      console.debug(`Downloading ${imageUrl}`);
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer"
      });
      await sleep(50);
      images.push([imageUrl, response.data, response.headers["content-type"]]);
    } catch (e) {
      if (e instanceof AxiosError) {
        throw new Error(
          `Can't download an '${imageUrl}' because '${e.cause?.message}'`
        );
      }
    }
  }
  return images;
}
