import { get, preload, remove } from "@three.ez/asset-manager";
import { createRadixSort, getBatchedMeshCount } from "@three.ez/batched-mesh-extensions";
import { BatchedMesh, Matrix4, Mesh, MeshLambertMaterial, WebGLCoordinateSystem } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import { cellSize, owlFlyHeight } from "../data/config.js";

preload(GLTFLoader, 'rocket.glb');
export class Items extends BatchedMesh {
  public override name = "Items";

  constructor() {
    const rocket = get<GLTF>("rocket.glb").scene.children[0].children[0].children[0].children[0] as Mesh;
    const { vertexCount, indexCount } = getBatchedMeshCount([rocket.geometry]);

    super(10, vertexCount, indexCount, new MeshLambertMaterial());
    this.matrixAutoUpdate = false;
    this.matrixWorldAutoUpdate = false;
    // this.renderOrder = 3;
    this.castShadow = true;
    this.frustumCulled = false;

    this.customSort = createRadixSort(this);

    this.addGeometry(rocket.geometry);

    const matrix = new Matrix4();

    this.addEventListener('collision', (e) => { // TODO fix d.ts
      const itemIndex = this.getGeometryIdAt(e.instanceIndex);
      this.dispatchEvent({ type: 'active', itemIndex });

      this.deleteInstance(e.instanceIndex);
      this.bvh.delete(e.instanceIndex); // TODO improve
    });

    for (let i = 0; i < this.maxInstanceCount; i++) {
      const geometryIndex = 0;
      // const geometryIndex = Math.floor(Math.random() * geometries.length);
      this.addInstance(geometryIndex);
      const laneIndex = (Math.floor(Math.random() * 3) - 1) * 2;
      this.setMatrixAt(i, matrix.makeScale(0.1, 0.1, 0.1).setPosition(laneIndex, owlFlyHeight, (-i - 1) * cellSize * 45));
    }

    this.computeBVH(WebGLCoordinateSystem);

    remove("rocket.glb"); // TODO put in the package
  }
}
