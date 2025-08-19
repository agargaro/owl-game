import { get, preload } from "@three.ez/asset-manager";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { BufferGeometry, Mesh, MeshLambertMaterial } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import { owlFlyHeight } from "../data/config.js";
import { CustomEventMap } from "../data/events.js";

// TODO: add sorting

preload(GLTFLoader, 'coin.glb')
export class Coin extends InstancedMesh2<void, BufferGeometry, MeshLambertMaterial, CustomEventMap> {
  public override name = "Coin";

  constructor() {
    const gltf = get<GLTF>("coin.glb");
    const mesh = gltf.scene.children[0] as Mesh;

    super(mesh.geometry, new MeshLambertMaterial());

    this.addEventListener('collision', (e) => {
      // TODO add particles
      this.removeInstances(e.instanceIndex);
    });

    this.addInstances(1000, (obj, index) => {
      const laneIndex = Math.floor(Math.random() * 3) - 1;
      obj.position.set(laneIndex, owlFlyHeight, -index);
      obj.scale.divideScalar(2);
    });

    this.computeBVH();
  }
}
