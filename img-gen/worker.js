
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.searchParams.get('p');
    const m = url.searchParams.get('m');
    const u = url.searchParams.get('u');

    if (m === 'generate') {
      return this.generate(env, p, u);
    }

    return new JsonResponse({ error: 'Invalid method' }, { status: 400 });
  },

  async generate(env, prompt, user) {
    const response = await env.AI.run(
      '@cf/bytedance/stable-diffusion-xl-lightning',
      { prompt: `Neonpunk style, ${prompt}`, negative_prompt: 'text, word' }
    );

    const form = new FormData();
    form.append('image', new Blob([await convertStreamToArrayBuffer(response)]));

    const uploadResponse = await fetch(`https://api.imgbb.com/1/upload?expiration=0&key=${env.IMGBB_API_KEY}`, {
      method: 'POST',
      body: form
    });
    const responseJson = await uploadResponse.json();

    const todayDate = new Date().toLocaleDateString();
    const todayImages = JSON.parse(await env.DB.get(todayDate) || '[]');
    const imageRecord = {
      url: responseJson.data.url,
      likes: [],
      user,
      prompt,
      theme: await env.DB.get('_TODAYS_THEME'),
      timestamp: Date.now()
    };

    todayImages.push(imageRecord);
    await env.DB.put(todayDate, JSON.stringify(todayImages));
    return new JsonResponse(imageRecord);
  },
}

class JsonResponse extends Response {
  constructor(body, options = {}) {
    super(JSON.stringify(body), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      ...options
    });
  }
}

async function convertStreamToArrayBuffer(stream) {
  const reader = stream.getReader();
  const chunks = [];
  let totalLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      totalLength += value.length;
    }

    const arrayBuffer = new Uint8Array(totalLength);
    let position = 0;

    for (const chunk of chunks) {
      arrayBuffer.set(chunk, position);
      position += chunk.length;
    }

    return arrayBuffer.buffer;
  } catch (error) {
    console.error('Error while reading the stream:', error);
  }
}
