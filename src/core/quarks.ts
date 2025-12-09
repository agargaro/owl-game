import {get, preload} from "@three.ez/asset-manager";
//@ts-ignore
import {BatchedRenderer, QuarksLoader, QuarksUtil} from "three.quarks";
import { Group, Object3D, Object3DEventMap, Scene, Vector3 } from "three";

preload(QuarksLoader, 'quarks/nw.json');

interface MissileAnimation {
    skillName: string;
    missile: Object3D<Object3DEventMap>;
    time: number;
    totalTime: number;
    startPosition: Vector3;
    targetPosition: Vector3;
}

export class Quarks {
    private static _batchedRenderer = new BatchedRenderer();
    private static  effects = new Map<string, Object3D>();
    private static _scene: Scene;
    private static _quarksMissiles: MissileAnimation[] = [];

    public static init(scene: Scene) {
       const obj = get<Object3D>('quarks/nw.json');
       this.effects = new Map<string, Object3D>();
       obj.traverse((child: Object3D) => {
           if (child instanceof Group) {
               const baseName = child.name.split('_')[1];
               this.effects.set(baseName, child);

               for (let i = 0; i < child.children.length; i++) {
                   const sub = child.children[i];
                   if (sub.name.startsWith('Missile')) this.effects.set(baseName + '_Missile', sub);
                   else if (sub.name.startsWith('Explosion')) this.effects.set(baseName + '_Explosion', sub);
               }
               QuarksUtil.setAutoDestroy(child, true);
               QuarksUtil.stop(child);
           }
       });
       this._scene = scene;
       scene.add(this._batchedRenderer);
    }
    public static prewarm (effects: string[]) {
        for (const name of effects) {
            const obj = this.play(name, {position: new Vector3(9999,9999,9999)});
            if (obj) QuarksUtil.stop(obj);
        }
    }
    public static play(
        name: string,
        options?: { position?: Vector3; scale?: number; rotation?: number }
    ) {
        const src = this.effects.get(name);
        if (!src) return;


        const cloned = src.clone(true);
        if (options?.position) cloned.position.copy(options.position);
        if (options?.scale) cloned.scale.setScalar(options.scale);
        if (options?.rotation) cloned.rotation.y = options.rotation;

        this._scene.add(cloned);
        QuarksUtil.addToBatchRenderer(cloned, Quarks._batchedRenderer);
        QuarksUtil.restart(cloned);

        return cloned;
    }

    public static update(dt: number) {
        this._batchedRenderer.update(dt);

        for (let i = this._quarksMissiles.length - 1; i >= 0; i--) {
            const m =  this._quarksMissiles[i];

            m.time += dt;

            const t = m.time < m.totalTime ? m.time / m.totalTime : 1;

            m.missile.position.set(
                m.startPosition.x + (m.targetPosition.x - m.startPosition.x) * t,
                m.startPosition.y + (m.targetPosition.y - m.startPosition.y) * t,
                m.startPosition.z + (m.targetPosition.z - m.startPosition.z) * t
            );

            if (m.time >= m.totalTime) {
                m.missile.userData.trigger?.();
                QuarksUtil.stop(m.missile);

                // swap-remove
                this._quarksMissiles[i] = this._quarksMissiles[this._quarksMissiles.length - 1];
                this._quarksMissiles.pop();
            }
        }
    }

}