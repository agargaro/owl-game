import { get, preload, remove } from "@three.ez/asset-manager";
import { createRadixSort, getBatchedMeshCount } from "@three.ez/batched-mesh-extensions";
import {
    BatchedMesh,
    Matrix4,
    Mesh,
    MeshLambertMaterial,
    Texture,
    WebGLCoordinateSystem
} from "three";
import {GLTF, GLTFLoader, KTX2Loader} from "three/examples/jsm/Addons.js";
import { cellSize, owlFlyHeight } from "../data/config.js";

preload(GLTFLoader, 'models/rocket.glb');
preload(KTX2Loader, 'textures/rocket.ktx2');
export class Items extends BatchedMesh {
  public override name = "Items";

  constructor() {
    const rocket = get<GLTF>("models/rocket.glb").scene.children[0].children[0].children[0].children[0] as Mesh;
    const { vertexCount, indexCount } = getBatchedMeshCount([rocket.geometry]);
    const texture = get<Texture>('textures/rocket.ktx2');
      const mat = new MeshLambertMaterial({ map: texture });

      mat.onBeforeCompile = (shader) => {
          shader.uniforms.t = { value: 0 };

          shader.vertexShader = shader.vertexShader.replace(
              'void main() {',
              'uniform float t;\nvoid main() {'
          );

          shader.vertexShader = shader.vertexShader.replace(
                      '#include <begin_vertex>',
                      `#include <begin_vertex>
            float cy = cos(t), sy = sin(t);
            float cx = cos(t*0.7), sx = sin(t*0.7);
          
            // Y rotation
            transformed = vec3(
              cy * transformed.x - sy * transformed.z,
              transformed.y,
              sy * transformed.x + cy * transformed.z
            );
          
            // X rotation
            transformed = vec3(
              transformed.x,
              cx * transformed.y - sx * transformed.z,
              sx * transformed.y + cx * transformed.z
            );
          `
          );


          mat.userData.shader = shader;
      };
    super(1, vertexCount, indexCount, mat);
    this.matrixAutoUpdate = false;
    this.matrixWorldAutoUpdate = false;
    // this.renderOrder = 3;
    this.castShadow = true;
    this.frustumCulled = false;

    this.customSort = createRadixSort(this);

    this.addGeometry(rocket.geometry);

    const matrix = new Matrix4();

    this.addEventListener('collision' as any, (e) => { // TODO fix d.ts
      const itemIndex = this.getGeometryIdAt(e.instanceIndex);
      this.setVisibleAt(e.instanceIndex, false);
      this.dispatchEvent({ type: 'active' as any, itemIndex });  // TODO fix d.ts
    });

    for (let i = 0; i < this.maxInstanceCount; i++) {
      const geometryIndex = 0;
      // const geometryIndex = Math.floor(Math.random() * geometries.length);
      this.addInstance(geometryIndex);
       const laneIndex = (Math.floor(Math.random() * 3) - 1) * 2;
     // const laneIndex = 1; // force center lane for now
      // TODO 20 is the start... put in the config?
      this.setMatrixAt(i, matrix.makeScale(0.1, 0.1, 0.1).setPosition(laneIndex, owlFlyHeight, (-i - 1) * cellSize * (20 + 42)));
    }

    this.computeBVH(WebGLCoordinateSystem);

    this.on('animate', (e) => {if (mat.userData.shader)
        mat.userData.shader.uniforms.t.value = e.total;
        });

    remove("models/rocket.glb", "textures/rocket.ktx2"); // TODO put in the package
  }
}
