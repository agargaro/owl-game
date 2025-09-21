import { get, preload, remove } from "@three.ez/asset-manager";
import { createRadixSort, getBatchedMeshCount } from "@three.ez/batched-mesh-extensions";
import { BatchedMesh, Matrix4, Mesh, Texture, TextureLoader } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import { chunkRows } from "../data/config.js";
import { MeshStandardMultiTextureMaterial } from "../material/MeshStandardMultiTextureMaterial.js";
import { rand } from "../utils/random.js";

preload(GLTFLoader, 'terrain.glb');
preload(TextureLoader, 'Light_Bake_Terrain1.png', 'Light_Bake_Terrain2.png', 'Light_Bake_Terrain3.png', 'Light_Bake_Terrain4.png', 'Light_Bake_Terrain5.png', 'Light_Bake_Terrain6.png');
export class Terrain extends BatchedMesh {
  public override name = "Terrain";
  private geometryCount = 6;

  constructor() {
    const gltf = get<GLTF>("terrain.glb");
    const geometries = gltf.scene.children.map(child => (child as Mesh).geometry);
    const { vertexCount, indexCount } = getBatchedMeshCount(geometries);

    const textures = [
      get<Texture>('Light_Bake_Terrain1.png'),
      get<Texture>('Light_Bake_Terrain2.png'),
      get<Texture>('Light_Bake_Terrain3.png'),
      get<Texture>('Light_Bake_Terrain4.png'),
      get<Texture>('Light_Bake_Terrain5.png'),
      get<Texture>('Light_Bake_Terrain6.png'),
    ];

    super(4, vertexCount, indexCount, new MeshStandardMultiTextureMaterial(textures));
    this.matrixAutoUpdate = false;
    this.matrixWorldAutoUpdate = false;
    this.renderOrder = 3;
    this.receiveShadow = true;
    this.frustumCulled = false;

    this.initUniformsPerInstance({ fragment: { 'textureIndex': 'float' } });

    for (const geometry of geometries) {
      this.addGeometry(geometry);
    }

    remove("terrain.glb", 'Light_Bake_Terrain1.png', 'Light_Bake_Terrain2.png', 'Light_Bake_Terrain3.png', 'Light_Bake_Terrain4.png', 'Light_Bake_Terrain5.png', 'Light_Bake_Terrain6.png'); // TODO put in the package
  }

  public generateChunk(chunkId: number): void {
    const geometryIndex = rand(this.geometryCount - 1);
    this.addInstance(geometryIndex);
    this.setMatrixAt(chunkId, matrix.setPosition(0, 0, chunkId * -chunkRows - chunkRows / 2));
    this.setUniformAt(chunkId, 'textureIndex', geometryIndex);
  }
}

const matrix = new Matrix4();
