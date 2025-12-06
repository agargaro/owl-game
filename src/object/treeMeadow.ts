import { get, preload, remove } from "@three.ez/asset-manager";
import {
    Group, Mesh, Texture
} from "three";
import {GLTF, GLTFLoader, KTX2Loader} from "three/examples/jsm/Addons.js";
import {MeadowTreeMaterial} from "../material/MeadowTreeMaterial.js";

preload(GLTFLoader, "models/tree-meadow.glb");
preload(KTX2Loader, "textures/leavesMask.ktx2");
export class TreeMeadow extends Group {
    public override name = "TreeMeadow";
    private _cycle = 0;
    constructor() {
        super();
        this.renderOrder = 5;
        this.frustumCulled = false;

        const gltf = get<GLTF>("models/tree-meadow.glb");
        const alphaMap = get<Texture>("textures/leavesMask.ktx2");
        const material = new MeadowTreeMaterial(alphaMap);
        this.add(...gltf.scene.children);
        if(this.children) {
            const child = this.children[0] as Mesh;
            child.material = material;
        }
        this.on("animate", (e) => material.update(e.delta));

        this.position.set(0.5,-4,-7);
        material.updateDayTime(this._cycle)
        remove("models/tree-meadow.glb", 'textures/meadowTex.ktx2');
    }

    public updateDayTime(cycle: number){
        this._cycle = cycle;
    }
}
