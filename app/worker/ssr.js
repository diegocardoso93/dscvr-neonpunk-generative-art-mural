export { handleSsr }

import { renderPage } from 'vike/server'

async function handleSsr(url, env) {
  const pageContextInit = {
    urlOriginal: url,
    theme: await env.DB.get('_TODAYS_THEME') || ''
  }

  const pageContext = await renderPage(pageContextInit)
  const { httpResponse } = pageContext
  const { readable, writable } = new TransformStream()
  httpResponse.pipe(writable)
  return new Response(readable)
}
