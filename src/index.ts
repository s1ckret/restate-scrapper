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
import {
  extractMessageMetadata,
  MessageMetadata
} from "./messageMetadataExtracter";
import { ParsedMessageBody, parseMessageBody } from "./messageBodyParser";
import { scrapeWebpage } from "./messageWebPageScrapper";
import { geocode, GeocodeResult } from "./geocoder";
import { downloadImages } from "./imageDownloader";
import { uploadImages } from "./imageUploader";
import { ads_currency, PrismaClient } from "@prisma/client";
const rl = readline.createInterface({ input, output });

const client = new TelegramClient(
  APPLICATION_NAME,
  TELEGRAM_API_ID,
  TELEGRAM_API_HASH,
  {
    connectionRetries: 5
  }
);

const prisma = new PrismaClient();

async function main() {
  await client.start({
    phoneNumber: () => rl.question("Enter your phone number: "),
    phoneCode: () => rl.question("Enter the code: "),
    password: () => rl.question("Enter your password: "),
    onError: (err: Error) => console.error(err)
  });

  const channel = await client.getEntity(TELEGRAM_CHANNEL_URL);

  const fromDate = toUnixTimestamp(new Date(FROM_DATE));
  const toDate = toUnixTimestamp(new Date(TO_DATE));

  const parameters = {
    offsetDate: fromDate,
    reverse: true,
    limit: 1
  };
  for await (const message of client.iterMessages(channel, parameters)) {
    if (message.date > toDate) {
      console.log(`Message is older '${message.date}' than - '${toDate}'`);
      return 0;
    }
    try {
      const metadata = extractMessageMetadata(message);
      const features = parseMessageBody(message.text);
      const [title, imageUrls] = await scrapeWebpage(metadata.webpageUrl);
      const geocodingResult = await geocode(
        features.street,
        features.houseNumber
      );

      const adExistInDatabase = !!(await prisma.ad.findFirst({
        where: { theirId: features.sourceId }
      }));

      if (adExistInDatabase) {
        console.log(
          `Skipped ad with their ID: ${features.sourceId} (already exist)`
        );
        continue;
      }

      const images = await downloadImages(imageUrls);
      const imageKeyPrefix = `${APPLICATION_NAME}/${features.sourceId}`;
      const [imageKeys, _] = await uploadImages(
        images,
        imageKeyPrefix,
        AWS_S3_BUCKET_NAME
      );

      await saveAdToDb(
        title,
        message.text,
        metadata,
        features,
        geocodingResult,
        imageKeys
      );

      console.log(`Saved ad with their ID: ${features.sourceId}`);
      // wait between messages
      // wait between days
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
    }
  }
}

async function saveAdToDb(
  title: string,
  description: string,
  metadata: MessageMetadata,
  features: ParsedMessageBody,
  geocodingResult: GeocodeResult,
  imageKeys: string[]
) {
  let currency = "USD" as ads_currency;
  if (features.currency === "грн") {
    currency = "UAH" as ads_currency;
  } else if (features.currency === "€") {
    currency = "EUR" as ads_currency;
  }

  const photos = imageKeys.map((it) => {
    return { key: it };
  });

  return await prisma.ad.upsert({
    where: {
      theirId: features.sourceId
    },
    update: {},
    include: {
      building: true,
      origin: true
    },
    create: {
      postedAtSec: metadata.postedAtSec,
      foundAtSec: Math.floor(new Date().getTime() / 1000),
      url: metadata.webpageUrl,
      title: title,
      description: description,
      theirId: features.sourceId,
      roomQty: features.price,
      totalArea: features.totalArea,
      atFloor: features.atFloor,
      price: features.price,
      currency: currency,
      readyForLiving: features.readyForLiving,
      building: {
        connectOrCreate: {
          create: {
            osmId: geocodingResult.osmId,
            country: features.country,
            city: features.city,
            street: geocodingResult.street,
            houseNumber: features.houseNumber,
            lat: geocodingResult.lat,
            lon: geocodingResult.lon,
            geojson: geocodingResult.geojson,
            maxFloors: features.buildingMaxFloor
          },
          where: {
            osmId: geocodingResult.osmId
          }
        }
      },
      origin: {
        connectOrCreate: {
          create: {
            name: "X-Estate Telegram scrapper",
            url: TELEGRAM_CHANNEL_URL
          },
          where: {
            url: TELEGRAM_CHANNEL_URL
          }
        }
      },
      photo: {
        createMany: {
          data: photos
        }
      }
    }
  });
}

async function shutdown() {
  console.log("Shutting down...");
  rl.close();
  client.disconnect();
  await prisma.$disconnect();
}

function toUnixTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

main()
  .then(async () => {
    await shutdown();
  })
  .catch(async (err) => {
    console.error(err);
    await shutdown();
    process.exit(1);
  });
