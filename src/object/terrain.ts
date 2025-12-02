import { get, preload, remove } from "@three.ez/asset-manager";
import { getBatchedMeshCount } from "@three.ez/batched-mesh-extensions";
import { BatchedMesh, Matrix4, Mesh, WebGLCoordinateSystem } from "three";
import { GLTF, GLTFLoader, KTX2Loader } from "three/examples/jsm/Addons.js";
import { chunkInstanceCount, chunkRows } from "../data/config.js";
import { MeshStandardMultiTextureMaterial } from "../material/MeshStandardMultiTextureMaterial.js";
import { rand } from "../utils/random.js";
import {DataArrayTexture} from "three";

preload(GLTFLoader, 'terrain.glb');
preload(KTX2Loader, 'terrain_array.ktx2');
export class Terrain extends BatchedMesh {
  public override name = "Terrain";
  public lastId = 0;
  declare private _geometryCount: number;

  constructor() {
    const gltf = get<GLTF>("terrain.glb");

    const geometries = gltf.scene.children.map(child => (child as Mesh).geometry);
    const { vertexCount, indexCount } = getBatchedMeshCount(geometries);
    const textures = get<DataArrayTexture>('terrain_array.ktx2');

    super(chunkInstanceCount, vertexCount, indexCount, new MeshStandardMultiTextureMaterial(textures));
    this.matrixAutoUpdate = false;
    this.matrixWorldAutoUpdate = false;
    this.renderOrder = 3;
    this.receiveShadow = true;
    this.frustumCulled = false;

    // we prefer to fetch textureIndex in the vertexShader instead of fragmentShader in this case
    this.initUniformsPerInstance({ vertex: { 'textureIndex': 'float' } });

    this.computeBVH(WebGLCoordinateSystem);

    for (const geometry of geometries) {
      this.addGeometry(geometry);
    }
      console.log(this);
    remove("terrain.glb", 'terrain_array.ktx2'); // TODO put in the package
  }

  public generateChunk(geometryId: number, chunkId: number): number {
    const id = this.addInstance(geometryId);
    this.setMatrixAt(id, matrix.setPosition(0, 0, chunkId * -chunkRows - chunkRows / 2));
    this.setUniformAt(id, 'textureIndex', geometryId);
    this.bvh.insert(id);
    return id;
  }

  public removeLastChunk(): number {
    const id = this.lastId++;
    this.lastId %= this.maxInstanceCount;
    this.deleteInstance(id);
    this.bvh.delete(id);
    return id;
  }

  public getNextChunkId(): number {
    return (this.lastId + 1) % this.maxInstanceCount;
  }
}

const matrix = new Matrix4();
