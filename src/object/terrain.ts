import { get, preload } from "@three.ez/asset-manager";
import { createRadixSort, getBatchedMeshCount } from "@three.ez/batched-mesh-extensions";
import { BatchedMesh, Matrix4, Mesh, MeshLambertMaterial, PlaneGeometry } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";

preload(GLTFLoader, 'terrain.glb')
export class Terrain extends BatchedMesh {
  public override name = "Terrain";

  constructor() {
    const gltf = get<GLTF>("terrain.glb");
    const geometries = gltf.scene.children.map(child => (child as Mesh).geometry);

    const { vertexCount, indexCount } = getBatchedMeshCount(geometries);

    super(50, vertexCount, indexCount, new MeshLambertMaterial());
    this.matrixAutoUpdate = false;
    this.matrixWorldAutoUpdate = false;
    this.renderOrder = 3;
    this.customSort = createRadixSort(this);

    for (const geometry of geometries) {
      this.addGeometry(geometry);
    }

    const matrix = new Matrix4();

    for (let i = 0; i < this.maxInstanceCount; i++) {
      const geometryIndex = Math.floor(Math.random() * geometries.length);
      this.addInstance(geometryIndex);
      this.setMatrixAt(i, matrix.makeTranslation(0, 0, i * -12));
    }
  }
}
