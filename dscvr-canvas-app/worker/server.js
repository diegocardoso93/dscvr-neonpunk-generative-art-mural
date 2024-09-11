export { handleServerRequest }

import { routes } from './routes'

async function handleServerRequest(request, env) {
  return await handleRoutes(routes, request, env)
}

async function handleRoutes(routes, request, env) {
  for (const [searchPath, caller] of Object.entries(routes)) {
    if (request.url.includes(searchPath)) {
      return await caller({request, env})
    }
  }
  return new Response()
}
