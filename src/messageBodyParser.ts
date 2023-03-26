function extractId(text: string): number {
  const match = text.match(/⚡️(\d*)/);
  if (!match) {
    throw new Error(`ID not found in ${text}`);
  }
  return parseInt(match[1]);
}

function extractRoomQty(text: string): number {
  if (text.match(/Гостинка|Гостинка/) !== null) {
    return 1;
  }
  const match = text.match(/([1-9])к/);
  if (!match) {
    throw new Error(`Room quantity not found in ${text}`);
  }
  return parseInt(match[1]);
}

function extractArea(text: string): number {
  const match = text.match(/([\d.]*)м²/);
  if (!match) {
    throw new Error(`Area not found in ${text}`);
  }
  return parseFloat(match[1]);
}

function extractFloor(text: string): [number, number] {
  const match = text.match(/(Поверх: |Этаж: )(\d*)\/(\d*)/);
  if (!match) {
    throw new Error(`Floor information not found in ${text}`);
  }
  return [parseInt(match[2]), parseInt(match[3])];
}

function extractPrice(text: string): [number, string] {
  const match = text.match(/(\d*) ([$€]|грн)/);
  if (!match) {
    throw new Error(`Price not found in ${text}`);
  }
  return [parseInt(match[1]), match[2]];
}

function extractStreet(text: string): [string, string] {
  const match = text.match(
    /((пр|ул|пер|вул|пров|бульв)[.\s]{1,}([\p{L}\d\s'-]{1,}))[,\s]{1,}([\d][\d\p{L}/\-.]*)/u
  );
  if (!match) {
    throw new Error(`Street information not found in ${text}`);
  }
  return [match[3].trim(), match[4].trim()];
}

function extractLivingState(text: string): boolean {
  const match = text.match(
    /Строительное состояние|Будівельний стан|Під ремонт/
  );
  return !match;
}

export interface ParsedMessageBody {
  sourceId: number;
  roomQty: number;
  totalArea: number;
  atFloor: number;
  buildingMaxFloor: number;
  price: number;
  currency: string;
  country: string;
  city: string;
  street: string;
  houseNumber: string;
  readyForLiving: boolean;
}

export function parseMessageBody(text: string): ParsedMessageBody {
  text = text.replaceAll("\n", " | ");
  const id: number = extractId(text);
  const roomQty: number = extractRoomQty(text);
  const area: number = extractArea(text);
  const [atFloor, buildingMaxFloor] = extractFloor(text);
  const [price, currency] = extractPrice(text);
  const [street, houseNumber] = extractStreet(text);
  const readyForLiving: boolean = extractLivingState(text);

  return {
    sourceId: id,
    roomQty: roomQty,
    totalArea: area,
    atFloor: atFloor,
    buildingMaxFloor: buildingMaxFloor,
    price: price,
    currency: currency,
    country: "Україна",
    city: "Харків",
    street: street,
    houseNumber: houseNumber,
    readyForLiving: readyForLiving
  };
}
