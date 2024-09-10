import { createGenericFile, Umi } from "@metaplex-foundation/umi";

export class Uploader {
  umi: Umi;
  constructor(umi: Umi) {
    this.umi = umi;
  }

  async uploadImage(imageBuffer: Buffer, fileType = "jpeg") {
    const file = createGenericFile(imageBuffer, `asset.${fileType}`, {
      tags: [{ name: 'contentType', value: 'image/jpeg' }],
    });
    const [imageUri] = await this.umi.uploader.upload([file]).catch((err) => {
      throw new Error(err)
    });
    return imageUri;
  }

  async uploadJson(metadata: any) {
    const [assetUri] = await this.umi.uploader.uploadJson(metadata).catch((err) => {
      throw new Error(err)
    });
    return assetUri;
  }
}
