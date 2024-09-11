import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { create, fetchAssetV1, mplCore } from '@metaplex-foundation/mpl-core'
import { generateSigner, keypairIdentity, } from '@metaplex-foundation/umi'
import { base58 } from '@metaplex-foundation/umi/serializers'
import express from "express"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const port = process.env.PORT || 5173

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Configure Umi
const umi = createUmi(process.env.SOLANA_RPC_URL || '', 'processed')
const keypair = umi.eddsa.createKeypairFromSecretKey(base58.serialize(process.env.PAYER_WALLET_PRIVATE_KEY || ''))
umi.use(keypairIdentity(keypair))
umi.use(mplCore())

// Index
app.get("/", (req, res) => {
  console.log("GET /")
  res.send("mpl-core-minter")
})

// Create an asset with provided name, uri and owner
app.post("/mint", async (req, res) => {
  console.log(req.body, req.headers)
  const assetData = req.body

  if (req.headers['x-auth-key'] == process.env.ADMIN_SERVICE_KEY) {
    const assetAddress = generateSigner(umi)
    await create(umi, {
      ...assetData,
      asset: assetAddress
    }).sendAndConfirm(umi)

    const asset = await fetchAssetV1(umi, assetAddress.publicKey)
    return res.send({ success: true, asset })
  }

  return res.send({ success: false })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send("Something broke!")
})

// Start server
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})

export default app
