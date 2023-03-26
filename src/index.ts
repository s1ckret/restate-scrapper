import { TelegramClient, Api } from "telegram";
import {
  TELEGRAM_API_ID,
  TELEGRAM_API_HASH,
  TELEGRAM_CHANNEL_URL,
  FROM_DATE,
  TO_DATE
} from "./config";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Interface } from "node:readline";
import { extractMessageMetadata } from "./messageMetadataExtracter";
import { parseMessageBody } from "./messageBodyParser";
import { scrapeWebpage } from "./messageWebPageScrapper";
import { geocode } from "./geocoder";

async function main() {
  const rl = readline.createInterface({ input, output });

  const client = new TelegramClient(
    "x_estate_data_parser",
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
    limit: 2
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
      console.log(messageBodyFeatures);
      console.log(geocodingResult);

      // Download all photos
      // Upload all photos to S3 (save those urls)
      // Save building to a database
      // Save ad to a database
      // Save photos to a database
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
