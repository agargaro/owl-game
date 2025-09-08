import { DataArrayTexture, LinearFilter, LinearMipMapLinearFilter, Texture } from "three";

export function createDataArrayTexture(textures: Texture[]): DataArrayTexture {
  if (textures.length < 2) throw new Error("At least two textures are required to create a DataArrayTexture");

  const width = textures[0].image.width;
  const height = textures[0].image.height;

  for (let i = 1; i < textures.length; i++) {
    if (textures[i].image.width !== width || textures[i].image.height !== height) {
      throw new Error("All textures must have the same dimensions to create a DataArrayTexture");
    }
  }

  const textureCount = textures.length;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const pixels = new Uint8Array(width * height * 4 * textureCount);

  for (let i = 0; i < textureCount; i++) {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(textures[i].image, 0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height);
    pixels.set(imgData.data, i * width * height * 4);
  }

  const dataArrayTex = new DataArrayTexture(pixels, width, height, textureCount);
  dataArrayTex.minFilter = LinearMipMapLinearFilter;
  dataArrayTex.magFilter = LinearFilter;
  dataArrayTex.generateMipmaps = true;
  dataArrayTex.needsUpdate = true;

  return dataArrayTex;
}
