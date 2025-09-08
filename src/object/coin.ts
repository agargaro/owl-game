import { get, preload, remove } from "@three.ez/asset-manager";
import { createRadixSort, InstancedMesh2 } from "@three.ez/instanced-mesh";
import { BufferGeometry, Mesh, MeshLambertMaterial, MeshStandardMaterial, Quaternion, Vector3 } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import { owlFlyHeight } from "../data/config.js";
import { CustomEventMap } from "../data/events.js";

// TODO: use meshLamberMaterial for all?

preload(GLTFLoader, 'coin.glb')
export class Coin extends InstancedMesh2<{}, BufferGeometry, MeshLambertMaterial, CustomEventMap> {
  public override name = "Coin";
  public collectedCount = 0;

  constructor() {
    const gltf = get<GLTF>("coin.glb");
    const mesh = gltf.scene.children[0] as Mesh<BufferGeometry, MeshStandardMaterial>;
    const baseMaterial = mesh.material;


    super(mesh.geometry, new MeshLambertMaterial({ color: baseMaterial.color }), { createEntities: true });
    this.matrixAutoUpdate = false;
    this.matrixWorldAutoUpdate = false;
    this.renderOrder = 2;
    this.castShadow = true;

    this.sortObjects = false;

    this.addEventListener('collision', (e) => {
      // TODO add particles
      this.collectedCount++;
      this.removeInstances(e.instanceIndex);
    });

    this.addInstances(1000, (obj, index) => {
      const laneIndex = Math.floor(Math.random() * 3) - 1;
      obj.position.set(laneIndex * 2, owlFlyHeight, -index * 2);
      obj.scale.divideScalar(1.5);
    });

    this.computeBVH({ margin: 0.1 });

    const instances = this.instances;
    const quaternion = new Quaternion();
    const yAxis = new Vector3(0, 1, 0);

    this.on('animate', (e) => quaternion.setFromAxisAngle(yAxis, e.total * 3));

    this.onFrustumEnter = (index) => {
      const instance = instances[index];
      instance.quaternion.copy(quaternion);
      instance.updateMatrix();
      return true;
    }

    remove("coin.glb"); // TODO put in the package
  }
}
