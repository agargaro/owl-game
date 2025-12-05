import { get, preload, remove } from "@three.ez/asset-manager";
import {
    Group, Mesh, MeshLambertMaterial, SRGBColorSpace, Texture, TextureLoader
} from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";

preload(GLTFLoader, "models/pine-meadow.glb");
preload(TextureLoader, 'textures/meadowTex.png');
export class PineMeadow extends Group {
  public override name = "PineMeadow";
  constructor() {
    super();
    this.renderOrder = 5;
    this.frustumCulled = false;

    const gltf = get<GLTF>("models/pine-meadow.glb");
    const texture = get<Texture>('textures/meadowTex.png');
    texture.colorSpace = SRGBColorSpace;
    this.add(...gltf.scene.children);
    if(this.children) {
        const child = this.children[0] as Mesh;
        child.material = new MeshLambertMaterial({map: texture, side: 2});
    }
    this.position.set(0,0.5,-15);
    remove("models/pine-meadow.glb", 'textures/meadowTex.ktx2');
  }
}
