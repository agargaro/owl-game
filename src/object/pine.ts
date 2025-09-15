import { get, preload, remove } from "@three.ez/asset-manager";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { BufferGeometry, Mesh, MeshLambertMaterial, MeshStandardMaterial } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import { CustomEventMap } from "../data/events.js";

preload(GLTFLoader, 'pine.glb')
export class Pine extends InstancedMesh2<void, BufferGeometry, MeshLambertMaterial, CustomEventMap> {
  public override name = "Pine";

  constructor() {
    const gltf = get<GLTF>("pine.glb");
    const mesh = gltf.scene.children[0] as Mesh<BufferGeometry, MeshStandardMaterial>;

    super(mesh.geometry, new MeshLambertMaterial({ color: 'green' })); // todo remove color
    this.matrixAutoUpdate = false;
    this.matrixWorldAutoUpdate = false;
    this.renderOrder = 1;
    this.castShadow = true;

    this.addEventListener('collision', (e) => {
      this.removeInstances(e.instanceIndex); // remove
      // TODO end game? should be moved
    });

    this.addInstances(50, (obj, index) => {
      const laneIndex = (Math.floor(Math.random() * 3) - 1) * 2; // TODO use cellSize
      obj.position.set(laneIndex, 0, -index * 20);
    });

    this.computeBVH();

    remove("pine.glb"); // TODO put in the package
  }
}
