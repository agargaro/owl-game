import { get, preload } from "@three.ez/asset-manager";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { BufferGeometry, Mesh, MeshLambertMaterial } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import { owlFlyHeight } from "../data/config.js";
import { CustomEventMap } from "../data/events.js";

preload(GLTFLoader, 'pine.glb')
export class Pine extends InstancedMesh2<void, BufferGeometry, MeshLambertMaterial, CustomEventMap> {
  public override name = "Pine";

  constructor() {
    const gltf = get<GLTF>("pine.glb");
    const geometry = (gltf.scene.children[0] as Mesh).geometry;

    super(geometry, new MeshLambertMaterial({ color: 'green' }));

    this.addEventListener('collision', (e) => {
      this.removeInstances(e.instanceIndex); // remove
      // TODO end game? should be moved
    });

    this.addInstances(50, (obj, index) => {
      const laneIndex = Math.floor(Math.random() * 3) - 1;
      obj.position.set(laneIndex, owlFlyHeight, -index * 20);
    });

    this.computeBVH();
  }
}
