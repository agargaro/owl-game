import { get, preload, remove } from "@three.ez/asset-manager";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { BufferGeometry, Mesh, MeshLambertMaterial, MeshStandardMaterial, Quaternion, Vector3 } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
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

    // const maxSpawnPerRow = 2;
    // const capacity = chunkInstanceCount * (chunkRows / cellSize) * maxSpawnPerRow; // TODO add check if resize buffer
    const capacity = 200; // TODO add check if resize buffer

    super(mesh.geometry, new MeshLambertMaterial({ color: baseMaterial.color }), { createEntities: true, capacity });
    this.matrixAutoUpdate = false;
    this.matrixWorldAutoUpdate = false;
    this.renderOrder = 2;
    this.castShadow = true;
    this.frustumCulled = false;

    this.addEventListener('collision', (e) => {
      // TODO add particles
      this.collectedCount++;
      this.removeInstances(e.instanceIndex);
    });

    this.computeBVH({ margin: 0.1 });

    const quaternion = new Quaternion();
    const yAxis = new Vector3(0, 1, 0);

    this.on('animate', (e) => quaternion.setFromAxisAngle(yAxis, e.total * 3));

    this.onFrustumEnter = (index) => {
      const instance = this.instances[index];
      instance.quaternion.copy(quaternion);
      instance.updateMatrix();
      return true;
    }

    remove("coin.glb"); // TODO put in the package
  }
}
