import { ParsedMessageBody, parseMessageBody } from "../src/messageBodyParser";

const messageBody1 = `⚡️337209 (https://t.me/iv?url=https://kvartirant.x-estate.app/kharkiv/advertisements/337209/preview&rhash=4b483bd9f88369)
🔑2к
✏️75.0м²
🔺Поверх: 1/2 ⚠️
📍Салтівка, ЖК Парус, вул. Барабашова 36а
〽️ м. Студентська
💵87000 $
ℹ️ Новобудова! 
#Салтівка2к
#Салтівка2кНовострой`;

const messageBodyParsed1: ParsedMessageBody = {
  sourceId: 337209,
  roomQty: 2,
  totalArea: 75.0,
  atFloor: 1,
  buildingMaxFloor: 2,
  price: 87000,
  currency: "$",
  country: "Україна",
  city: "Харків",
  street: "Барабашова",
  houseNumber: "36а",
  readyForLiving: true
};

const messageBody2 = `⚡️224614 (https://telegra.ph/224614-Prodayotsya-1-komnatnaya-kvartira-Centr-07-17)
🔑1к
✏️42.43м²
🔺Этаж: 5/10
📍Центр, ЖК Брюссель, ул. Маршала Бажанова 11 (стр.)
💵55000 $
ℹ️ Новострой! Строительное состояние. 
#Центр1к
#Центр1кНовострой`;

const messageBodyParsed2: ParsedMessageBody = {
  sourceId: 224614,
  roomQty: 1,
  totalArea: 42.43,
  atFloor: 5,
  buildingMaxFloor: 10,
  price: 55000,
  currency: "$",
  country: "Україна",
  city: "Харків",
  street: "Маршала Бажанова",
  houseNumber: "11",
  readyForLiving: false
};

const messageBodyMissingId = ` (https://t.me/iv?url=https://kvartirant.x-estate.app/kharkiv/advertisements/337209/preview&rhash=4b483bd9f88369)
🔑2к
✏️75.0м²
🔺Поверх: 1/2 ⚠️
📍Салтівка, ЖК Парус, вул. Барабашова 36а
〽️ м. Студентська
💵87000 $
ℹ️ Новобудова! 
#Салтівка2к
#Салтівка2кНовострой`;

const messageBodyMissingArea = `⚡️337209 (https://t.me/iv?url=https://kvartirant.x-estate.app/kharkiv/advertisements/337209/preview&rhash=4b483bd9f88369)
🔑2к
✏️
🔺Поверх: 1/2 ⚠️
📍Салтівка, ЖК Парус, вул. Барабашова 36а
〽️ м. Студентська
💵87000 $
ℹ️ Новобудова! 
#Салтівка2к
#Салтівка2кНовострой`;

const messageBodyHouseNumber = `⚡️337209 (https://t.me/iv?url=https://kvartirant.x-estate.app/kharkiv/advertisements/337209/preview&rhash=4b483bd9f88369)
🔑2к
✏️75.0м²
🔺Поверх: 1/2 ⚠️
📍Салтівка, ЖК Парус, вул. Барабашова
〽️ м. Студентська
💵87000 $
ℹ️ Новобудова! 
#Салтівка2к
#Салтівка2кНовострой`;

describe("message body parser", () => {
  it.each([
    [messageBody1, messageBodyParsed1],
    [messageBody2, messageBodyParsed2]
  ])(
    "should extract features from message body %p successfully",
    (messageBody: string, messageBodyParsed: ParsedMessageBody) => {
      const parsedMessage = parseMessageBody(messageBody);

      expect(parsedMessage).toStrictEqual(messageBodyParsed);
    }
  );

  it.each([
    [messageBodyMissingId, new Error("ID not found")],
    [messageBodyMissingArea, new Error("Area not found")],
    [messageBodyHouseNumber, new Error("Street information not found")]
  ])(
    "should throw Error because some feature is missing for message %p",
    (messageBody: string, error: Error) => {
      expect(() => parseMessageBody(messageBody)).toThrowError(error);
    }
  );
});
