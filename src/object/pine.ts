import { get, preload, remove } from "@three.ez/asset-manager";
import { createRadixSort, InstancedMesh2 } from "@three.ez/instanced-mesh";
import { BufferGeometry, Mesh, MeshLambertMaterial, MeshStandardMaterial } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import { CustomEventMap } from "../data/events.js";
import { cellSize, chunkInstanceCount, chunkRows } from "../data/config.js";

preload(GLTFLoader, 'pine.glb')
export class Pine extends InstancedMesh2<void, BufferGeometry, MeshLambertMaterial, CustomEventMap> {
  public override name = "Pine";

  constructor() {
    const gltf = get<GLTF>("pine.glb");
    const mesh = gltf.scene.children[0] as Mesh<BufferGeometry, MeshStandardMaterial>;

    const maxSpawnPerRow = 2;
    const spawnRowInterval = 4;
    const capacity = chunkInstanceCount * (chunkRows / cellSize) * maxSpawnPerRow / spawnRowInterval;

    super(mesh.geometry, new MeshLambertMaterial({ color: 'green' }), { capacity }); // todo remove color
    this.matrixAutoUpdate = false;
    this.matrixWorldAutoUpdate = false;
    this.renderOrder = 1;
    this.castShadow = true;
    this.frustumCulled = false;
    this.sortObjects = true;

    this.customSort = createRadixSort(this as InstancedMesh2<any>); // TODO fix def

    this.addEventListener('collision', (e) => {
      this.setVisibilityAt(e.instanceIndex, false);
      // TODO end game? should be moved
    });

    this.computeBVH();

    remove("pine.glb"); // TODO put in the package
  }
}
