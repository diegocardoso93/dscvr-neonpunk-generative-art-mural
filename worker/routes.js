
export const routes = {
  '?url': binaryImage,
  '/images': imageList,
  '/generate': generateImage,
  '/like': like,
  '/previous': previousList,
  '/finish': finish,
  '/mint': mint,
}

async function binaryImage({ request }) {
  const imgUrl = request.url.replace(/.*?url=/, '')
  return new Response(await imageUrlToBlob(imgUrl), {headers: {'content-type': 'application/jpeg'}})
}

async function imageList({ env }) {
  let imgs = JSON.parse(await env.DB.get((new Date).toLocaleDateString()) || '[]')
  return new Response(JSON.stringify(imgs), {headers: {'content-type': 'application/json'}})
}

async function generateImage({ request, env }) {
  const { prompt, user } = await request.json()
  console.log(prompt, user)
  let imgs = JSON.parse(await env.DB.get((new Date).toLocaleDateString()) || '[]')
  if (imgs.find(img => img.user === user)) {
    return new Response(JSON.stringify({message: 'You already created image today!'}), { headers: { 'content-type': 'application/json' }})
  }
  const response = await env.IMG_AI.fetch(`https://dscvr-canvas-img-gen.cloudflareai.workers.dev/?m=generate&p=${prompt}&u=${user}`)
  const reg = await response.json()
  console.log(reg)
  return new Response(JSON.stringify({message: 'Success!', reg }), {headers: {'content-type': 'application/json'}})
}

async function like({ request, env }) {
  const { user, url } = await request.json()
  console.log(user, url)
  const response = await env.IMG_AI.fetch(`https://dscvr-canvas-img-gen.cloudflareai.workers.dev/?m=like&p=${url}&u=${user}`)
  const ret = await response.json()
  return new Response(JSON.stringify(ret), {headers: {'content-type': 'application/json'}})
}

async function previousList({ env }) {
  let finished = JSON.parse(await env.DB.get('_FINISHED') || '[]')
  return new Response(JSON.stringify(finished), {headers: {'content-type': 'application/json'}})
}

async function finish({ env }) {
  let finished = JSON.parse(await env.DB.get('_FINISHED') || '[]')
  let imgs = JSON.parse(await env.DB.get((new Date).toLocaleDateString()) || '[]')
  imgs.sort(function (a, b) {
    const [alikes, blikes] = [a.likes.length, b.likes.length]
    const [ats, bts] = [a.timestamp, b.timestamp]
    if (alikes > blikes) {
      return 1
    } else if (alikes < blikes) {
      return -1
    } else if (ats > bts) {
      return 1
    } else if (ats < bts) {
      return -1
    }
    return 0
  })
  finished.push({date: (new Date).toLocaleDateString(), winner: imgs[0], claimed: []})
  await env.DB.put('_FINISHED', JSON.stringify(finished))
  return new Response(JSON.stringify({message: 'Success!', finished }), {headers: {'content-type': 'application/json'}})
}

async function mint({ request, env }) {
  const input = await request.json()

  const response = await fetch(`${env.MINT_SERVICE_HOST}/mint`, {
    method: 'post',
    body: JSON.stringify(input),
    headers: {'content-type': 'application/json'}
  })
  const json = await response.json()

  return new Response(JSON.stringify(json), {headers: {'content-type': 'application/json'}})
}
