import {Color, DirectionalLight, Fog, HemisphereLight} from "three";
import {cameraFar} from "../data/config.js";

const LIGHT_COLORS = {
    hemiSky: {
        day: new Color(0xFFFFFF),
        dusk: new Color(0xfddaff),
        night: new Color(0xaacafe)
    },
    hemiGround: {
        day: new Color(0xFFFFFF),
        dusk: new Color(0xb98d80),
        night: new Color(0x3a3e75)
    },
    dir: {
        day: new Color(0xFFFFFF),
        dusk: new Color(0xFFFFFF),
        night: new Color(0xa9a9ff)
    }
};
const FOG_COLORS = {
    dayMain: new Color(0x7cbded),
    dayFlight: new Color(0x7cbded),
    duskMain: new Color(0x652919),
    duskFlight: new Color(0xd0716d),
    nightMain: new Color(0x060b14),
    nightFlight: new Color(0x02030a)
};

export class Environment {
    public hemiLight = new HemisphereLight(0xffffff, 0x6e654f, 1);
    public directionalLight = new DirectionalLight('white', 2);
    public fog = new Fog(0x070d21, 20, cameraFar);
    private _skyColor = new Color();
    private _groundColor = new Color();
    private _dirColor = new Color();
    private _isFlight = false;

    constructor() {
        this._setupLight();
    }

    private _setupLight(): void {
        const dirLight = this.directionalLight;
        const shadowCamera = dirLight.shadow.camera;
        dirLight.position.set(5, 10, 0);
        dirLight.castShadow = true;
        shadowCamera.left = -3;
        shadowCamera.right = 3;
        shadowCamera.top = 40;
        shadowCamera.bottom = 0;
        shadowCamera.updateProjectionMatrix();
        dirLight.shadow.mapSize.set(256, 1024);
        dirLight.shadow.bias = -0.0001;
        dirLight.shadow.normalBias = -0.0001;
    }

    public updateDayTime(cycle: number): void {
        const isFlight = this._isFlight;
        const skyKeys = [LIGHT_COLORS.hemiSky.night, LIGHT_COLORS.hemiSky.dusk, LIGHT_COLORS.hemiSky.day];
        const groundKeys = [LIGHT_COLORS.hemiGround.night, LIGHT_COLORS.hemiGround.dusk, LIGHT_COLORS.hemiGround.day];
        const dirKeys = [LIGHT_COLORS.dir.night, LIGHT_COLORS.dir.dusk, LIGHT_COLORS.dir.day];
        const fogKeys = !isFlight ? [FOG_COLORS.nightMain, FOG_COLORS.duskMain, FOG_COLORS.dayMain] : [FOG_COLORS.nightFlight, FOG_COLORS.duskFlight, FOG_COLORS.dayFlight];

        const t = cycle * 2;
        const i = Math.min(Math.floor(t), skyKeys.length - 2);
        const f = t - i;

        this._skyColor.copy(skyKeys[i]).lerp(skyKeys[i + 1], f);
        this._groundColor.copy(groundKeys[i]).lerp(groundKeys[i + 1], f);
        this._dirColor.copy(dirKeys[i]).lerp(dirKeys[i + 1], f);
        this.fog.color.copy(fogKeys[i]).lerp(fogKeys[i + 1], f);

        this.hemiLight.color.copy(this._skyColor);
        this.hemiLight.groundColor.copy(this._groundColor);
        this.directionalLight.color.copy(this._dirColor);

        this.hemiLight.intensity = !isFlight ? (cycle * 0.1 + (1 - cycle + 1)) : cycle * 0.1 + 0.5;
        this.directionalLight.intensity = !isFlight ? (cycle * 0.1 + 4) : cycle * 0.1 + 2;

        this.fog.near = !isFlight ? Math.max(cycle * 20, 5) : Math.min((1 - cycle) * 35, 10);
        this.fog.far = !isFlight ? Math.max(cameraFar * cycle, 25) : cameraFar;
    }

    public setFlight(isFlight: boolean, cycle: number): void {
        this._isFlight = isFlight;
        this.updateDayTime(cycle);
    }
}
