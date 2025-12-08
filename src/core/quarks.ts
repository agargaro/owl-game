import {get, preload} from "@three.ez/asset-manager";
import {BatchedRenderer, QuarksLoader, QuarksUtil} from "three.quarks";
import {Group, Object3D, Scene, Vector3} from "three";


preload(QuarksLoader, 'quarks/nw.json');
export class Quarks {
    private static _batchedRenderer = new BatchedRenderer();
    private static _effects = new Map<string, Object3D>();
    private static _scene: Scene;

    constructor(scene: Scene) {
       const quarks =  get<Object3D>('quarks/nw.json');
       const effects = new Map<string, Object3D>();
       quarks.traverse((child: Object3D) => {
           if (child instanceof Group) {
               const baseName = child.name.split('_')[1];
               effects.set(baseName, child);

               for (let i = 0; i < child.children.length; i++) {
                   const sub = child.children[i];
                   if (sub.name.startsWith('Missile')) effects.set(baseName + '_Missile', sub);
                   else if (sub.name.startsWith('Explosion')) effects.set(baseName + '_Explosion', sub);
               }

               QuarksUtil.setAutoDestroy(child, true);
               QuarksUtil.stop(child);
           }
       });
       Quarks._effects = effects;
       Quarks._scene = scene;
       Quarks._scene.add(Quarks._batchedRenderer);
       Quarks.warmup();
    }
    private static warmup() {
        for (const [name] of Quarks._effects) {
            const obj = Quarks.play(name, { position: new Vector3(9999, 9999, 9999) });
            if (obj) QuarksUtil.stop(obj);
        }
    }

    public static play(
        name: string,
        options?: { position?: Vector3; scale?: number; rotation?: number }
    ) {
        console.log('Playing', name)
        const src = Quarks._effects.get(name);
        if (!src) return;

        const cloned = src.clone(true);

        if (options?.position) cloned.position.copy(options.position);
        if (options?.scale) cloned.scale.setScalar(options.scale);
        if (options?.rotation) cloned.rotation.y = options.rotation;

        Quarks._scene.add(cloned);
        QuarksUtil.addToBatchRenderer(cloned, Quarks._batchedRenderer);
        QuarksUtil.restart(cloned);

        return cloned;
    }

    public static update(dt: number) {
        Quarks._batchedRenderer.update(dt);
    }

}