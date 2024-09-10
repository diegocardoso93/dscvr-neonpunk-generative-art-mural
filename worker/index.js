import { handleSsr } from './ssr'
import { handleStaticAssets } from './static-assets'
import { handleServerRequest } from './server'

// addEventListener('fetch', (event) => {
//   try {
//     console.log(event);
//     event.respondWith(
//       handleFetchEvent(event).catch((err) => {
//         console.error(err.stack)
//       })
//     )
//   } catch (err) {
//     console.error(err.stack)
//     event.respondWith(new Response('Internal Error', { status: 500 }))
//   }
// })

export default {
	async fetch(request, env, ctx) {
    return handleFetchEvent(request, env, ctx)
	},
};


async function handleFetchEvent(request, env, ctx) {
  let response
  if (isAssetUrl(request.url)) {
    response = await handleStaticAssets(request, env, ctx)
  } else if (isServerUrl(request.url)) {
    response = await handleServerRequest(request, env)
  } else {
    response = await handleSsr(request.url, env)
  }
  return response
}

function isAssetUrl(url) {
  const { pathname } = new URL(url)
  return pathname.startsWith('/assets/')
}

function isServerUrl(url) {
  const { pathname } = new URL(url)
  return pathname.startsWith('/api/')
}
