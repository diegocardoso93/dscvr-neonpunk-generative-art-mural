

export async function getImageBase64FromUrl(img) {
  const response = await fetch(`/api/images/?url=${img.url}`);
  const blob = await response.blob();
  return `data:image/jpeg;base64,${await imageUrlToBase64(blob)}`;
}


export async function getImageFromUrl(img) {
  const response = await fetch(`/api/images/?url=${img.url}`);
  const blob = await response.blob();
  const objectURL = URL.createObjectURL(blob);
  return {objectURL, blob};
  // return `data:image/jpeg;base64,${await imageUrlToBase64(blob)}`;
}

async function imageUrlToBase64(blob) {
  try {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        if (!reader.result) resolve(null)
        if (reader.result) {
          const base64String = reader.result.toString().split(',')[1];
          resolve(base64String);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to Base64:', error);
    throw error;
  }
}
