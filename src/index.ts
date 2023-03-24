import { TelegramClient } from "telegram";
import {
  TELEGRAM_API_ID,
  TELEGRAM_API_HASH,
  TELEGRAM_CHANNEL_URL
} from "./config";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

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

  for await (const message of client.iterMessages(channel, { limit: 2 })) {
    console.log(message.id, message.text);
  }
  client.disconnect();
  rl.close();
}

main().catch((err) => {
  console.error(err);
});
