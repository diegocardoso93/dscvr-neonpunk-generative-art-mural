import { handleSsr } from './ssr'
import { handleStaticAssets } from './static-assets'
import { handleServerRequest } from './server'

export default {
  async fetch(request, env, ctx) {
    return handleFetchEvent(request, env, ctx)
  },
}

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
