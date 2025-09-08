import { MeshStandardMaterial, MeshStandardMaterialParameters, Texture, WebGLProgramParametersWithUniforms, WebGLRenderer } from 'three';
import { createDataArrayTexture } from '../utils/createDataArrayTexture.js';

export class MeshStandardMultiTextureMaterial extends MeshStandardMaterial {
  protected _textures: Texture[];

  constructor(protected textures: Texture[], parameters?: MeshStandardMaterialParameters) {
    super(parameters);

    this._textures = textures;
  }

  public override onBeforeCompile(p: WebGLProgramParametersWithUniforms, r: WebGLRenderer): void {
    p.uniforms.mapArray = { value: createDataArrayTexture(this._textures) };

    p.defines.USE_UV = '';

    p.fragmentShader = p.fragmentShader.replace('#include <map_pars_fragment>', /* glsl */`
      uniform float textureIndex;
      uniform sampler2DArray mapArray;
    `);

    p.fragmentShader = p.fragmentShader.replace('#include <map_fragment>', /* glsl */`
      diffuseColor *= texture(mapArray, vec3(vUv, textureIndex));
    `);
  }
}
