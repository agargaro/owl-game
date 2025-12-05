import {
    DataArrayTexture, MeshLambertMaterial, MeshLambertMaterialParameters,
    WebGLProgramParametersWithUniforms, WebGLRenderer
} from 'three';

export class MeshStandardMultiTextureMaterial extends MeshLambertMaterial {
  protected _textures: DataArrayTexture;

  constructor(protected textures: DataArrayTexture, parameters?: MeshLambertMaterialParameters) {
    super(parameters);

    this._textures = textures;
  }

  public override onBeforeCompile(p: WebGLProgramParametersWithUniforms, r: WebGLRenderer): void {
    p.uniforms.mapArray = { value: this._textures};

      p.defines =  { USE_UV: '' }

      p.fragmentShader = p.fragmentShader.replace(
          '#include <map_pars_fragment>',
          `
        uniform float textureIndex;
        uniform sampler2DArray mapArray;
      `
      );

      p.fragmentShader = p.fragmentShader.replace(
          '#include <map_fragment>',
          `
        diffuseColor *= texture(mapArray, vec3(vUv, textureIndex));
      `
      );
  }
}
