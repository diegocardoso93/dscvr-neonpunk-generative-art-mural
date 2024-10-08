# DSCVR Neonpunk Generative Art Mural
An embedded app built to DSCVR, powered by DSCVR Canvas and Metaplex CORE.

Other tools:
- Vite, Vike, Vue
- Cloudflare Pages, Workers, AI, KV
- ImgBB to host images

## How it works
- **Daily Theme:** Each day, we select a new theme for our mural, which can be an animal, object, place or anything that inspires.
- **Create Art:** Users can generate an image based on the daily theme by submitting creative prompts.
- **Community Voting:** Once submissions are in, the community votes for their favorite artworks.
- **Win and Earn:** The artwork with the most votes is minted as an NFT. At the end of the day, users who voted for the winning piece can claim an NFT.

## Components

#### dscvr-canvas-app
The `dscvr-canvas-app` base folder.  

#### mpl-core-minter
A node.js application for minting NFTs utilizing Metaplex CORE.
