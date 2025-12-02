import { get, preload, remove } from "@three.ez/asset-manager";
import { createRadixSort, InstancedMesh2 } from "@three.ez/instanced-mesh";
import {BufferGeometry, Mesh, MeshLambertMaterial, MeshStandardMaterial, Texture} from "three";
import {GLTF, GLTFLoader, KTX2Loader} from "three/examples/jsm/Addons.js";
import { DefaultEventMap } from "../data/events.js";
import { cellSize, chunkInstanceCount, chunkRows} from "../data/config.js";

preload(GLTFLoader, 'models/pine.glb')
preload(KTX2Loader, 'textures/pinetree.ktx2');
export class Pine extends InstancedMesh2<void, BufferGeometry, MeshLambertMaterial, DefaultEventMap> {
  public override name = "Pine";

  constructor() {
    const gltf = get<GLTF>("models/pine.glb");
    const mesh = gltf.scene.children[0] as Mesh<BufferGeometry, MeshStandardMaterial>;

    const maxSpawnPerRow = 2;
    const spawnRowInterval = 4;
    const capacity = chunkInstanceCount * (chunkRows / cellSize) * maxSpawnPerRow / spawnRowInterval;
    const texture = get<Texture>('textures/pinetree.ktx2');
    super(mesh.geometry, new MeshLambertMaterial({ map: texture, side: 2 }), { capacity }); // todo remove color
    this.matrixAutoUpdate = false;
    this.matrixWorldAutoUpdate = false;
    this.renderOrder = 1;
    this.castShadow = true;
    this.frustumCulled = false;
    this.sortObjects = true;

    this.customSort = createRadixSort(this as InstancedMesh2<any>); // TODO fix def

    this.computeBVH();

    remove("models/pine.glb"); // TODO put in the package
  }
}
