import { Buffer } from 'node:buffer';

async function handleServerRequest(request, env) {
  if (request.url.includes('?url')) {
    const imgUrl = request.url.replace(/.*?url=/, '')
    return new Response(await imageUrlToBlob(imgUrl), {headers: {'content-type': 'application/jpeg'}})
  } else if (request.url.includes('/images')) {
    let imgs = JSON.parse(await env.DB.get((new Date).toLocaleDateString()) || '[]')
    return new Response(JSON.stringify(imgs), {headers: {'content-type': 'application/json'}})
  } else if (request.url.includes('/generate')) {
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
  } else if (request.url.includes('/like')) {
    const { user, url } = await request.json()
    console.log(user, url)
    const response = await env.IMG_AI.fetch(`https://dscvr-canvas-img-gen.cloudflareai.workers.dev/?m=like&p=${url}&u=${user}`)
    const ret = await response.json()
    return new Response(JSON.stringify(ret), {headers: {'content-type': 'application/json'}})
  } else if (request.url.includes('/previous')) {
    let finished = JSON.parse(await env.DB.get('_FINISHED') || '[]')
    return new Response(JSON.stringify(finished), {headers: {'content-type': 'application/json'}})
  } else if (request.url.includes('/finish')) {
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
  } else if (request.url.includes('/mint')) {
    const input = await request.json()

    const response = await fetch(`https://ifeedy.com.br/mint`, {
      method: 'post',
      body: JSON.stringify(input),
      headers: {'content-type': 'application/json'}
    })
    const json = await response.json()

    return new Response(JSON.stringify(json), {headers: {'content-type': 'application/json'}})
    // return new Response(JSON.stringify({ transaction: ix, success: true, input }), {headers: {'content-type': 'application/json'}})
  }


  return new Response()
}

export { handleServerRequest }


async function imageUrlToBlob(imageUrl) {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return await response.blob()
  } catch (error) {
    console.error('Error converting image to Base64:', error)
    throw error
  }
}

export function base64toBuffer(base64Image) {
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}
