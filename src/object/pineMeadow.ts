import { get, preload, remove } from "@three.ez/asset-manager";
import {
    Group, Mesh,  MeshLambertMaterial, Texture
} from "three";
import { GLTF, GLTFLoader, KTX2Loader } from "three/examples/jsm/Addons.js";

preload(GLTFLoader, "models/pine-meadow.glb");
preload(KTX2Loader, 'textures/meadowTex.ktx2');
export class PineMeadow extends Group {
  public override name = "PineMeadow";
  constructor() {
    super();
    this.renderOrder = 5;
    this.frustumCulled = false;

    const gltf = get<GLTF>("models/pine-meadow.glb");
    const texture = get<Texture>('textures/meadowTex.ktx2');
    this.add(...gltf.scene.children);
    if(this.children) {
        const child = this.children[0] as Mesh;
        child.material = new MeshLambertMaterial({map: texture, side: 2});
    }
    this.position.set(0,1,-15);
    remove("models/pine-meadow.glb", 'textures/meadowTex.ktx2');
  }
}
