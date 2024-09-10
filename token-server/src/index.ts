import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { buildUmiUploader } from "./utils";
import { Uploader } from "./uploader";
import { CreateToken } from "./types";
import { SPLTokenBuilder } from "./spl-token-builder";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5173;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const umi = buildUmiUploader(
  process.env.SOLANA_RPC_URL || "",
  process.env.UPLOADER_WALLET_PRIVATE_KEY || ""
);
const uploader = new Uploader(umi);
console.log(process.env.SOLANA_RPC_URL);

// Routes
app.get("/", (req: Request, res: Response) => {
  console.log("GET /");
  res.send("Express + TypeScript Server 2");
});

app.post("/mint",
  async (req: Request, res: Response) => {
    console.log(req.body);
    const input = req.body;

    let createToken: CreateToken = {
      name: input.winner.theme,
      symbol: 'NEONPUNK',
      description: `Neonpunk Generative Art Mural reward date ${input.date}.`,
      decimals: 0,
      supply: 1,
      revokeUpdate: false,
      revokeFreeze: false,
      revokeMint: false,
      creatorWallet: input.creatorWallet
    };

    let imageUrl = await uploader.uploadImage(base64toBuffer(input.src));

    console.log(imageUrl);

    let metadataUrl = await uploader.uploadJson({
      name: createToken.name,
      symbol: createToken.symbol,
      description: createToken.description,
      image: imageUrl,
      prompt: input.winner.prompt,
      date: input.winner.date
    });

    console.log(metadataUrl);

    let tokenBuilder = new SPLTokenBuilder(process.env.SOLANA_RPC_URL || "");
    let ix = await tokenBuilder.build(
      createToken,
      metadataUrl
    )

    return res.send({ transaction: ix, success: true });
  }
);


function base64toBuffer(base64Image: string) {
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}


// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start server
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app;
