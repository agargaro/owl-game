import { get, preload, remove } from "@three.ez/asset-manager";
import {
    Group, Mesh, Texture, TextureLoader
} from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import {MeadowTreeMaterial} from "../material/MeadowTreeMaterial.js";

preload(GLTFLoader, "https://douges.dev/static/tree.glb");
preload(TextureLoader, "https://douges.dev/static/foliage_alpha3.png");
export class TreeMeadow extends Group {
    public override name = "TreeMeadow";
    constructor() {
        super();
        this.renderOrder = 5;
        this.frustumCulled = false;

        const gltf = get<GLTF>("https://douges.dev/static/tree.glb");
        const alphaMap = get<Texture>("https://douges.dev/static/foliage_alpha3.png");
        const material = new MeadowTreeMaterial(alphaMap);
        this.add(...gltf.scene.children);
        if(this.children) {
            const child = this.children[3] as Mesh;
            child.material = material;
        }
        this.on("animate", (e) => material.update(e.delta));

        this.position.set(-1,-5,-3);
        remove("https://douges.dev/static/tree.glb", 'textures/meadowTex.ktx2');
    }
}
