import { get, preload } from "@three.ez/asset-manager";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { BufferGeometry, Mesh, MeshLambertMaterial, MeshStandardMaterial } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import { owlFlyHeight } from "../data/config.js";
import { CustomEventMap } from "../data/events.js";

preload(GLTFLoader, 'pine.glb')
export class Pine extends InstancedMesh2<void, BufferGeometry, MeshStandardMaterial, CustomEventMap> {
  public override name = "Pine";

  constructor() {
    const gltf = get<GLTF>("pine.glb");
    const mesh = gltf.scene.children[0] as Mesh<BufferGeometry, MeshStandardMaterial>;

    super(mesh.geometry, mesh.material);
    this.matrixAutoUpdate = false;
    this.matrixWorldAutoUpdate = false;
    this.renderOrder = 1;

    this.addEventListener('collision', (e) => {
      this.removeInstances(e.instanceIndex); // remove
      // TODO end game? should be moved
    });

    this.addInstances(50, (obj, index) => {
      const laneIndex = Math.floor(Math.random() * 3) - 1;
      obj.position.set(laneIndex, 0, -index * 20);
    });

    this.computeBVH();
  }
}
