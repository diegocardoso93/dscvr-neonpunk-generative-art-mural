// ********************************************
// This code was provided by Cloudflare Workers
// ********************************************
import manifestJSON from "__STATIC_CONTENT_MANIFEST";

import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

export { handleStaticAssets }

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = false

const assetManifest = JSON.parse(manifestJSON);

async function handleStaticAssets(request, env, ctx) {
  let options = {
    ASSET_NAMESPACE: env.__STATIC_CONTENT,
    ASSET_MANIFEST: assetManifest,
  }

  /**
   * You can add custom logic to how we fetch your assets
   * by configuring the function `mapRequestToAsset`
   */
  // options.mapRequestToAsset = handlePrefix(/^\/docs/)

  try {
    if (DEBUG) {
      // customize caching
      options.cacheControl = {
        bypassCache: true
      }
    }
    
    const page = await getAssetFromKV({
      request,
      waitUntil(promise) {
        return ctx.waitUntil(promise);
      },
    }, options)

    // allow headers to be altered
    const response = new Response(page.body, page)

    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Referrer-Policy', 'unsafe-url')
    response.headers.set('Feature-Policy', 'none')

    return response
  } catch (e) {
    // if an error is thrown try to serve the asset at 404.html
    if (!DEBUG) {
      try {
        let notFoundResponse = await getAssetFromKV({
          request,
          waitUntil(promise) {
            return ctx.waitUntil(promise);
          },
        }, {
          mapRequestToAsset: (req) => new Request(`${new URL(req.url).origin}/404.html`, req)
        })

        return new Response(notFoundResponse.body, {
          ...notFoundResponse,
          status: 404
        })
      } catch (e) {}
    }

    return new Response(e.message || e.toString(), { status: 500 })
  }
}
