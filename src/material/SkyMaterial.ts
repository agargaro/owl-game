import {
    MeshBasicMaterial,
    WebGLProgramParametersWithUniforms
} from "three";

export class SkyMaterial extends MeshBasicMaterial {
    private _cycle = 0;
    private _uniforms: any;

    constructor() {
        super();
        this.fog = false;
    }

    public override onBeforeCompile = (p: WebGLProgramParametersWithUniforms) => {
        this._uniforms = p.uniforms;
        this._uniforms.cycle = { value: this._cycle };

        p.vertexShader = p.vertexShader.replace(
            'void main() {',
            `
            varying vec2 vUv;
            void main() {
              vUv = uv;
            `
        );

        p.fragmentShader = `
            varying vec2 vUv;
            uniform float cycle;
            ` + p.fragmentShader;

        p.fragmentShader = p.fragmentShader.replace(
            '#include <colorspace_fragment>',
            `
            #include <colorspace_fragment>
            
            vec3 dayTop = vec3(0.95, 0.95, 0.95);
            vec3 dayMid = vec3(0.416, 0.764, 0.973);
            vec3 dayBot = vec3(0.028, 0.518, 0.859);

            vec3 duskTop = vec3(0.929, 0.678, 0.882);
            vec3 duskMid = vec3(0.849, 0.416, 0.510);
            vec3 duskBot = vec3(0.922, 0.427, 0.208);

            vec3 nightTop = vec3(0.024, 0.039, 0.063);
            vec3 nightMid = vec3(0.043, 0.075, 0.118);
            vec3 nightBot = vec3(0.078, 0.169, 0.247);

            
            vec3 topColor;
            vec3 midColor;
            vec3 botColor;

            if (cycle < 0.5) {
                float t = cycle * 2.0; // 0 → 1
                topColor = mix(dayTop, duskTop, t);
                midColor = mix(dayMid, duskMid, t);
                botColor = mix(dayBot, duskBot, t);
            } else {
                float t = (cycle - 0.5) * 2.0; // 0 → 1
                topColor = mix(duskTop, nightTop, t);
                midColor = mix(duskMid, nightMid, t);
                botColor = mix(duskBot, nightBot, t);
            }

            vec3 finalColor;
            if (vUv.y < 0.5) {
                    finalColor = mix(topColor, midColor, vUv.y * 2.0);
                } else {
                    finalColor = mix(midColor, botColor, (vUv.y - 0.5) * 2.0);
            }

            gl_FragColor = vec4(finalColor, 1.0);
            `
        );
    };
    public updateDayTime(cycle: number) {
        this._cycle = 1 - cycle;
        if (this._uniforms) {
            this._uniforms.cycle.value = 1 - cycle;
        }
    }
}
