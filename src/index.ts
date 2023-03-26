import { TelegramClient, Api } from "telegram";
import {
  TELEGRAM_API_ID,
  TELEGRAM_API_HASH,
  TELEGRAM_CHANNEL_URL,
  FROM_DATE,
  TO_DATE,
  APPLICATION_NAME,
  AWS_S3_BUCKET_NAME
} from "./config";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Interface } from "node:readline";
import { extractMessageMetadata } from "./messageMetadataExtracter";
import { parseMessageBody } from "./messageBodyParser";
import { scrapeWebpage } from "./messageWebPageScrapper";
import { geocode } from "./geocoder";
import { downloadImages } from "./imageDownloader";
import { uploadImages } from "./imageUploader";

async function main() {
  const rl = readline.createInterface({ input, output });

  const client = new TelegramClient(
    APPLICATION_NAME,
    TELEGRAM_API_ID,
    TELEGRAM_API_HASH,
    {
      connectionRetries: 5
    }
  );

  await client.start({
    phoneNumber: () => rl.question("Enter your phone number: "),
    phoneCode: () => rl.question("Enter the code: "),
    password: () => rl.question("Enter your password: "),
    onError: (err: Error) => console.error(err)
  });

  const channel = await client.getEntity(TELEGRAM_CHANNEL_URL);

  // Save origin to a database

  const fromDate = toUnixTimestamp(new Date(FROM_DATE));
  const toDate = toUnixTimestamp(new Date(TO_DATE));

  for await (const message of client.iterMessages(channel, {
    offsetDate: fromDate,
    reverse: true,
    limit: 1
  })) {
    if (message.date > toDate) {
      console.log(
        `Message '${message.id} is older '${message.date}' than set limit - '${toDate}'`
      );
      shutdown(client, rl);
      return 0;
    }
    try {
      const metadata = extractMessageMetadata(message);
      const messageBodyFeatures = parseMessageBody(message.text);
      const [title, imageUrls] = await scrapeWebpage(metadata.webpageUrl);
      const geocodingResult = await geocode(
        messageBodyFeatures.street,
        messageBodyFeatures.houseNumber
      );
      // Check if ad is not in a database
      // If true proceed
      // Save building to a database
      // Save ad to a database
      // Save photos to a database
      const images = await downloadImages(imageUrls);
      const imageKeyPrefix = `${APPLICATION_NAME}/${messageBodyFeatures.sourceId}`;
      const s3ImageUrls = await uploadImages(
        images,
        imageKeyPrefix,
        AWS_S3_BUCKET_NAME
      );
      console.log(messageBodyFeatures);
      console.log(s3ImageUrls);
      // Else skip
      // wait between messages
      // wait between days
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
    }
  }
  shutdown(client, rl);
}

function shutdown(client: TelegramClient, rl: Interface) {
  console.log("Shutting down...");
  client.disconnect();
  rl.close();
}

function toUnixTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

main().catch((err) => {
  console.error(err);
});
