import { downloadImages } from "../src/imageDownloader";

describe("image downloader", () => {
  it("should download messages", async () => {
    const response = await downloadImages([
      "https://kvartirant-photos.s3.eu-central-1.amazonaws.com/333819/vGWOfDHdlnsAx5iHvKJmoNae0lPqQw2Oxd2t.jpg"
    ]);
    expect(response[0][2]).toBe("image/jpeg");
  });

  it("should throw error if download fails", async () => {
    expect(
      async () => await downloadImages(["https://s1ckret.com/image-test"])
    ).rejects.toThrow("Can't download");
  });
});
