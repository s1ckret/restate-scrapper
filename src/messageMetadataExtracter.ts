import { Api } from "telegram";

export interface MessageMetadata {
  webpageUrl: string;
  webpageTitle: string | undefined;
  postedAtSec: number;
}

export function extractMessageMetadata(message: Api.Message): MessageMetadata {
  if (message.media) {
    const mediaWebPage = message.media as Api.MessageMediaWebPage;
    const webpage = mediaWebPage.webpage as Api.WebPage;
    return {
      webpageUrl: webpage.url,
      webpageTitle: webpage.title,
      postedAtSec: message.date
    };
  } else {
    throw new Error("Message media attribute is not present");
  }
}
