// Define routes mapping
export const routes = {
  '?url': binaryImage,
  '/images': imageList,
  '/generate': generateImage,
  '/like': like,
  '/previous': previousList,
  '/finish': finish,
  '/mint': mint,
  '/claimed': saveClaimed,
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
  const imgs = JSON.parse(await env.DB.get(todayDate) || '[]')

  if (imgs.some(img => img.user === user)) {
    return new Response(
      JSON.stringify({ message: 'You already created an image today!' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  const response = await env.IMG_AI.fetch(
    `https://dscvr-canvas-img-gen.cloudflareai.workers.dev/?m=generate&p=${encodeURIComponent(prompt)}&u=${encodeURIComponent(user)}`
  )
  const imageRecord = await response.json()
  console.log(imageRecord)


  // const response = await env.AI.run(
  //   '@cf/bytedance/stable-diffusion-xl-lightning',
  //   { prompt: `Neonpunk style, ${prompt}`, negative_prompt: 'text, word' }
  // )

  // const form = new FormData()
  // form.append('image', new Blob([await convertStreamToArrayBuffer(response)]))

  // const uploadResponse = await fetch(`https://api.imgbb.com/1/upload?expiration=0&key=${env.IMGBB_API_KEY}`, {
  //   method: 'POST',
  //   body: form
  // })
  // const responseJson = await uploadResponse.json()

  // const todayDate = new Date().toLocaleDateString()
  // const todayImages = JSON.parse(await env.DB.get(todayDate) || '[]')
  // const imageRecord = {
  //   url: responseJson.data.url,
  //   likes: [],
  //   user,
  //   prompt,
  //   theme: await env.DB.get('_TODAYS_THEME'),
  //   timestamp: Date.now()
  // }

  // todayImages.push(imageRecord)
  // await env.DB.put(todayDate, JSON.stringify(todayImages))


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

// Finalize the day's images and determine the winner
async function finish({ env }) {
  const finished = JSON.parse(await env.DB.get('_FINISHED') || '[]')
  const todayDate = new Date().toLocaleDateString()
  const imgs = JSON.parse(await env.DB.get(todayDate) || '[]')

  imgs.sort((a, b) => {
    const alikes = a.likes.length
    const blikes = b.likes.length
    const ats = a.timestamp
    const bts = b.timestamp

    if (alikes !== blikes) return blikes - alikes
    return bts - ats
  })

  const winner = imgs[0]
  finished.push({ date: todayDate, winner, claimed: [] })
  await env.DB.put('_FINISHED', JSON.stringify(finished))

  return new JsonResponse({ message: 'Success!', finished })
}

// Mint a new resource
async function mint({ request, env }) {
  const input = await request.json()
  const response = await fetch(`${env.MINT_SERVICE_HOST}/mint`, {
    method: 'POST',
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' }
  })

  const json = await response.json()
  return new JsonResponse(json)
}

// Save user claimed NFT info
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

// Custom response class for JSON data
class JsonResponse extends Response {
  constructor(data) {
    super(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
  }
}
