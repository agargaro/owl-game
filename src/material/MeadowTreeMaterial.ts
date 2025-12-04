import {Color, MeshStandardMaterial, MeshStandardMaterialParameters, WebGLProgramParametersWithUniforms} from 'three';

export class MeadowTreeMaterial extends MeshStandardMaterial {
    protected shader: WebGLProgramParametersWithUniforms;
    constructor(alphaMap: any, parameters?: MeshStandardMaterialParameters) {
        super(parameters);
        this.shader = null;
        this.alphaMap = alphaMap;
        this.alphaTest = 0.5;
        this.color = new Color('#0b270b').convertLinearToSRGB();
    }

    public override onBeforeCompile(shader): void {
        this.shader = shader;

        shader.uniforms.u_effectBlend = { value: 1.0 };
        shader.uniforms.u_inflate     = { value: 0.0 };
        shader.uniforms.u_scale       = { value: 1.0 };
        shader.uniforms.u_windSpeed   = { value: 1.0 };
        shader.uniforms.u_windTime    = { value: 0.0 };

        shader.vertexShader = shader.vertexShader
            .replace(
                `#include <common>`,
                `
    #include <common>

    uniform float u_effectBlend;
    uniform float u_inflate;
    uniform float u_scale;
    uniform float u_windSpeed;
    uniform float u_windTime;

    float inverseLerp(float v, float a, float b) {
      return (v - a) / (b - a);
    }
    float remap(float v, float i0, float i1, float o0, float o1) {
      return mix(o0, o1, inverseLerp(v, i0, i1));
    }
    mat4 rotateZ(float r) {
      float c = cos(r);
      float s = sin(r);
      return mat4(
        c,-s,0,0,
        s, c,0,0,
        0, 0,1,0,
        0, 0,0,1
      );
    }

    vec4 applyWind(vec4 v) {
      float bounded = remap(normal.y, -1.0, 1.0, 0.0, 1.0);
      float posXZ = position.x + position.z;
      float power = u_windSpeed / 5.0 * -0.5;

      float top = remap(sin(u_windTime + posXZ), -1.0, 1.0, 0.0, power);
      float bottom = remap(cos(u_windTime + posXZ), -1.0, 1.0, 0.0, 0.05);
      float r = mix(bottom, top, bounded);

      return rotateZ(r) * v;
    }

    vec2 calcInitialOffsetFromUVs() {
      vec2 o = vec2(
        remap(uv.x, 0.0, 1.0, -1.0, 1.0),
        remap(uv.y, 0.0, 1.0, -1.0, 1.0)
      );
      o *= vec2(-1.0, 1.0);
      return normalize(o) * u_scale;
    }

    vec3 inflateOffset(vec3 o) {
      return o + normal * u_inflate;
    }
    `
            )
            .replace(
                `#include <begin_vertex>`,
                `
    #include <begin_vertex>
            vec2 offset = calcInitialOffsetFromUVs();
            vec3 inflated = inflateOffset(vec3(offset, 0.0));
            
            vec3 modified = position + mix(vec3(0.0), inflated, u_effectBlend);
            
            float bounded = remap(normal.y, -1.0, 1.0, 0.0, 1.0);
            float posXZ = position.x + position.z;
            float power = u_windSpeed / 5.0 * -0.5;
            
            float top = remap(sin(u_windTime + posXZ), -1.0, 1.0, 0.0, power);
            float bottom = remap(cos(u_windTime + posXZ), -1.0, 1.0, 0.0, 0.05);
            float r = mix(bottom, top, bounded);
            
            mat4 R = rotateZ(r);
            modified = (R * vec4(modified, 1.0)).xyz;
            
            transformed = modified;

    `
            );

    }
    update(dt) {
        if (!this.shader) return;
        this.shader.uniforms.u_windTime.value +=
            this.shader.uniforms.u_windSpeed.value * dt;
    }
}
