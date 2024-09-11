
import { imageUrlToBlob, convertStreamToArrayBuffer } from './utils'

// Define routes mapping
export const routes = {
  '?url': binaryImage,
  '/images': imageList,
  '/generate': generateImage,
  '/like': like,
  '/previous': previousList,
  '/mint': mint,
  '/claimed': saveClaimed,
  '/finish': finish,
  '/theme': changeTheme,
  '/metadata': metadata,
}

// Convert image URL to Blob
async function binaryImage({ request }) {
  const imgUrl = new URL(request.url).searchParams.get('url')
  const blob = await imageUrlToBlob(imgUrl)
  return new Response(blob, { headers: { 'Content-Type': 'image/jpeg' } })
}

// List images stored in DB for today
async function imageList({ env }) {
  const todayDate = new Date().toLocaleDateString()
  const imgs = JSON.parse(await env.DB.get(todayDate) || '[]')
  return new JsonResponse(imgs)
}

// Generate a new image based on prompt
async function generateImage({ request, env }) {
  const { prompt, user } = await request.json()
  console.log(prompt, user)

  const todayDate = new Date().toLocaleDateString()
  const todayImages = JSON.parse(await env.DB.get(todayDate) || '[]')

  if (todayImages.some(img => img.user === user)) {
    return new Response(
      JSON.stringify({ message: 'You already created an image today!' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  const response = await env.AI.run(
    '@cf/bytedance/stable-diffusion-xl-lightning',
    { prompt: `Neonpunk style, ${prompt}`, negative_prompt: 'text, word' }
  )

  const form = new FormData()
  form.append('image', new Blob([await convertStreamToArrayBuffer(response)]))

  const uploadResponse = await fetch(`https://api.imgbb.com/1/upload?expiration=0&key=${env.IMGBB_API_KEY}`, {
    method: 'POST',
    body: form
  })
  const responseJson = await uploadResponse.json()

  const imageRecord = {
    url: responseJson.data.url,
    likes: [],
    user,
    prompt,
    theme: await env.DB.get('_TODAYS_THEME'),
    timestamp: Date.now()
  }

  todayImages.push(imageRecord)
  await env.DB.put(todayDate, JSON.stringify(todayImages))

  return new JsonResponse({ message: 'Success!', reg: imageRecord })
}

// Handle image like requests
async function like({ request, env }) {
  const { user, url } = await request.json()

  const todayDate = new Date().toLocaleDateString()
  const todayImages = JSON.parse(await env.DB.get(todayDate) || '[]')
  const image = todayImages.find(img => img.url === url)

  if (image && !image.likes.includes(user)) {
    image.likes.push(user)
    await env.DB.put(todayDate, JSON.stringify(todayImages))
    return new JsonResponse({ ok: true })
  }

  return new JsonResponse({ ok: false })
}

// List previously finished images
async function previousList({ env }) {
  const finished = JSON.parse(await env.DB.get('_FINISHED') || '[]')
  return new JsonResponse(finished)
}

// Mint a new resource
async function mint({ request, env }) {
  const input = await request.json()

  const postData = {
    name: `Neonpunk - ${input.winner.theme}`,
    uri: `${new URL(request.url).origin}/api/metadata${input.date.replaceAll('/', '')}`,
    owner: input.address,
  }

  const response = await fetch(`${env.MINTER_SERVICE_HOST}/mint`, {
    method: 'POST',
    body: JSON.stringify(postData),
    headers: {
      'Content-Type': 'application/json',
      'interaction-key': env.MINTER_INTERACTION_KEY
    }
  })
  const json = await response.json()
  await saveClaimed({ request, env })

  return new JsonResponse(json)
}

// Save user claimed state
async function saveClaimed({ request, env }) {
  const input = await request.json()
  const finished = JSON.parse(await env.DB.get('_FINISHED') || '[]')
  const index = finished.findIndex(({ date }) => date === input.date)
  if (index > -1) {
    finished[index].claimed.push(input.user)
  }
  await env.DB.put('_FINISHED', JSON.stringify(finished))
  return new JsonResponse({ message: 'Success!', finished })
}

// Finalize the day's images and determine the winner
// @todo: restrict the access
async function finish({ env }) {
  const date = new URL(request.url).searchParams.get('date')
  if (!date) {
    return new JsonResponse({ message: 'Invalid request.' })
  }
  const finished = JSON.parse(await env.DB.get('_FINISHED') || '[]')
  const imgs = JSON.parse(await env.DB.get(date) || '[]')
  if (!imgs.length) {
    return new JsonResponse({ message: 'No creations available for this date.' })
  }

  imgs.sort((a, b) => {
    const alikes = a.likes.length
    const blikes = b.likes.length
    const ats = a.timestamp
    const bts = b.timestamp

    if (alikes !== blikes) return blikes - alikes
    return bts - ats
  })

  const winner = imgs[0]
  finished.push({ date, winner, claimed: [] })
  await env.DB.put('_FINISHED', JSON.stringify(finished))

  return new JsonResponse({ message: 'Success!', finished })
}

// Change today's theme
// @todo: restrict the access
async function changeTheme({ request }) {
  const subject = new URL(request.url).searchParams.get('subject')
  if (!subject) {
    return new JsonResponse({ message: 'Invalid request.' })
  }
  await env.DB.put('_TODAYS_THEME', subject)

  return new JsonResponse({ success: true })
}

// Get asset metadata
async function metadata({ request, env }) {
  const dt = request.url.replace(/.*metadata/, '')
  const finished = JSON.parse(await env.DB.get('_FINISHED') || '[]')
  const reg = finished.find(({ date }) => date.replaceAll('/', '') === dt)
  return new Response(JSON.stringify({
    name: `Neonpunk - ${reg.winner.theme}`,
    symbol: 'NEONPUNK',
    image: reg.winner.url,
    description: `Neonpunk Generative Art Mural reward date ${reg.date}.`,
    prompt: reg.winner.prompt,
    date: reg.date,
    user_created: reg.winner.user,
    user_dscvr: `https://dscvr.one/u/${reg.winner.user}`
  }), { headers: {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"} })
}

// Custom response class for JSON data
class JsonResponse extends Response {
  constructor(data) {
    super(JSON.stringify(data), { headers: { "Content-Type": "application/json" } })
  }
}
