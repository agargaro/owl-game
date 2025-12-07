import {GameScene} from "../core/scene-game.js";

export class DayTimeController {
    public cycle = 0;
    private _scene: GameScene;
    constructor(scene: GameScene) {
        this._scene = scene;
        this.updateGlobalCycle()
        window.setInterval(() => {
            this.updateGlobalCycle();
        }, 1000);
    }
    private updateGlobalCycle(){
        const now = new Date();
        const env = this._scene.env;
        const skyBox = this._scene.skyBox;
        const treeMeadow = this._scene.treeMeadow;


        const SHIFT = 1;
        const time = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
        const t = (time - SHIFT) * 0.2617993878;

        let c = 0.5 - 0.5 * Math.cos(t);

        const c2 = c * c;
        c = c2 * c * (c * (6 * c - 15) + 10);
        this.cycle = c;
        env.updateDayTime(c);
        skyBox.updateDayTime(c);
        treeMeadow.updateDayTime(c);
    }
}
