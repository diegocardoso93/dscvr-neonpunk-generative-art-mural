import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { create, fetchAssetV1, mplCore } from '@metaplex-foundation/mpl-core';
import { generateSigner, keypairIdentity, } from '@metaplex-foundation/umi';
import { base58 } from '@metaplex-foundation/umi/serializers';

const umi = createUmi('https://api.devnet.solana.com', 'processed')
const keypair = umi.eddsa.createKeypairFromSecretKey(base58.serialize('53yN1EpMLxMVz1n8PSV2mvrWiW7TRzDFLQH46FarYDj3JtchvqZTKz1y57nJJy4A6hoskyghC8EmuzWt3K9RYmKH'))
umi.use(keypairIdentity(keypair))
umi.use(mplCore())

// Create an asset
const assetAddress = generateSigner(umi);
const owner = generateSigner(umi);
await create(umi, {
  name: 'Neonpunk - Cat',
  uri: "https://dscvr-canvas.cloudflareai.workers.dev/api/metadata992024",
  asset: assetAddress,
  owner: owner.publicKey, // optional, will default to payer
}).sendAndConfirm(umi);

// Fetch an asset
const asset = await fetchAssetV1(umi, assetAddress.publicKey);

console.log({assetAddress, owner, asset})


// // Create a collection
// const collectionUpdateAuthority = generateSigner(umi);
// const collectionAddress = generateSigner(umi);
// await createCollection(umi, {
//   name: 'Test Collection',
//   uri: 'https://example.com/collection.json',
//   collection: collectionAddress,
//   updateAuthority: collectionUpdateAuthority.publicKey, // optional, defaults to payer
// }).sendAndConfirm(umi);

// // Fetch a collection
// const collection = await fetchCollection(umi, collectionAddress.publicKey);

// // Create an asset in a collection, the authority must be the updateAuthority of the collection
// await create(umi, {
//   name: 'Test Asset',
//   uri: 'https://example.com/asset.json',
//   asset: assetAddress,
//   collection,
//   authority: collectionUpdateAuthority, // optional, defaults to payer
// }).sendAndConfirm(umi);

// // Transfer an asset
// const recipient = generateSigner(umi);
// await transfer(umi, {
//   asset,
//   newOwner: recipient.publicKey,
// }).sendAndConfirm(umi);

// // Transfer an asset in a collection
// await transfer(umi, {
//   asset,
//   newOwner: recipient.publicKey,
//   collection,
// }).sendAndConfirm(umi);

// // GPA fetch assets by owner
// const assetsByOwner = await getAssetV1GpaBuilder(umi)
//   .whereField('key', Key.AssetV1)
//   .whereField('owner', owner.publicKey)
//   .getDeserialized();

// // GPA fetch assets by collection
// const assetsByCollection = await getAssetV1GpaBuilder(umi)
//   .whereField('key', Key.AssetV1)
//   .whereField(
//     'updateAuthority',
//     updateAuthority('Collection', [collectionAddress.publicKey])
//   )
//   .getDeserialized();

// console.log({assetAddress, owner, asset, collectionUpdateAuthority, collectionAddress, recipient, collection, assetsByOwner, assetsByCollection})

// DAS API (RPC based indexing) fetch assets by owner/collection
// Coming soon
