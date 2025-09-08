import { get, preload, remove } from "@three.ez/asset-manager";
import { createRadixSort, getBatchedMeshCount } from "@three.ez/batched-mesh-extensions";
import { BatchedMesh, BufferGeometry, Matrix4, Mesh, MeshStandardMaterial, Texture, TextureLoader } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import { terrainSize } from "../data/config.js";
import { MeshStandardMultiTextureMaterial } from "../material/MeshStandardMultiTextureMaterial.js";

preload(GLTFLoader, 'terrain.glb');
preload(TextureLoader, 'Light_Bake_Terrain1.png', 'Light_Bake_Terrain2.png', 'Light_Bake_Terrain3.png', 'Light_Bake_Terrain4.png', 'Light_Bake_Terrain5.png', 'Light_Bake_Terrain6.png');
export class Terrain extends BatchedMesh {
  public override name = "Terrain";

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

    super(50, vertexCount, indexCount, new MeshStandardMultiTextureMaterial(textures));
    this.matrixAutoUpdate = false;
    this.matrixWorldAutoUpdate = false;
    this.renderOrder = 3;
    this.receiveShadow = true;

    this.initUniformsPerInstance({ fragment: { 'textureIndex': 'float' } });

    this.customSort = createRadixSort(this);

    for (const geometry of geometries) {
      this.addGeometry(geometry);
    }

    const matrix = new Matrix4();

    for (let i = 0; i < this.maxInstanceCount; i++) {
      const geometryIndex = Math.floor(Math.random() * geometries.length);
      this.addInstance(geometryIndex);
      this.setMatrixAt(i, matrix.setPosition(0, 0, i * -terrainSize));
      this.setUniformAt(i, 'textureIndex', geometryIndex);
    }

    remove("terrain.glb", 'Light_Bake_Terrain1.png', 'Light_Bake_Terrain2.png', 'Light_Bake_Terrain3.png', 'Light_Bake_Terrain4.png', 'Light_Bake_Terrain5.png', 'Light_Bake_Terrain6.png'); // TODO put in the package
  }
}
