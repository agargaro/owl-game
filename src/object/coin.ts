import { get, preload } from "@three.ez/asset-manager";
import { createRadixSort, InstancedMesh2 } from "@three.ez/instanced-mesh";
import { BoxGeometry, BufferGeometry, CircleGeometry, Mesh, MeshStandardMaterial, TorusGeometry } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import { owlFlyHeight } from "../data/config.js";
import { CustomEventMap } from "../data/events.js";

// TODO: use meshLamberMaterial for all?

preload(GLTFLoader, 'coin.glb')
export class Coin extends InstancedMesh2<{}, BufferGeometry, MeshStandardMaterial, CustomEventMap> {
  public override name = "Coin";
  public collectedCount = 0;

  constructor() {
    const gltf = get<GLTF>("coin.glb");
    const mesh = gltf.scene.children[0] as Mesh<BufferGeometry, MeshStandardMaterial>;

    super(mesh.geometry, mesh.material, { createEntities: true });
    this.matrixAutoUpdate = false;
    this.matrixWorldAutoUpdate = false;
    this.renderOrder = 2;
    this.castShadow = true;

    // this.addShadowLOD(new TorusGeometry(0.1, 0.1, 4, 4));

    this.sortObjects = true;
    this.customSort = createRadixSort(this);

    this.addEventListener('collision', (e) => {
      // TODO add particles
      this.collectedCount++;
      console.log(this.collectedCount); // TODO remove
      this.removeInstances(e.instanceIndex);
    });

    this.addInstances(1000, (obj, index) => {
      const laneIndex = Math.floor(Math.random() * 3) - 1;
      obj.position.set(laneIndex * 2, owlFlyHeight, -index);
      obj.scale.divideScalar(1.5);
    });

    this.computeBVH({ margin: 0.1 });

    this.on('animate', (e) => {
      this.updateInstances((obj) => {
        obj.rotateY(e.delta * 3);
      });
    });
  }
}
