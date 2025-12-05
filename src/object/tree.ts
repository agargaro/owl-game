import { get, preload, remove } from "@three.ez/asset-manager";
import {
    AnimationAction, AnimationClip, AnimationMixer,
    Group, Mesh, MeshLambertMaterial, Texture
} from "three";
import { GLTF, GLTFLoader, KTX2Loader } from "three/examples/jsm/Addons.js";

preload(GLTFLoader, "models/tree.glb");
preload(KTX2Loader,
    `textures/tree-base.ktx2`,
);
export class Tree extends Group {
  public override name = "Tree";
  private readonly _mixer = new AnimationMixer(this);
  private _idleAction: AnimationAction;

  constructor() {
    super();
    this.renderOrder = 0;
    this.frustumCulled = false;

    const gltf = get<GLTF>("models/tree.glb");
    this.add(...gltf.scene.children);
    this.scale.divideScalar(8);
    this.position.y = -0.35;
    this.applySkins();
    this.initAnimation(gltf.animations);
    this._idleAction.fadeIn(.2).play();
    remove("models/tree.glb", "textures/tree-base.ktx2");
  }

  private applySkins(): void {
    const map = get<Texture>(`textures/tree-base.ktx2`);
    this.children[0].traverse((child) => {
        if (!['Armature', 'Tree_low'].includes(child.name)) {
            child.visible = false;
            return;
        }
        const mesh = child as Mesh;
        if (mesh.material) {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach((m) => m.dispose());
            } else {
                mesh.material.dispose();
            }
        }
        mesh.material = new MeshLambertMaterial({map: map, transparent: true, alphaTest: 0.5});
        mesh.visible = true;
    });
  }

  private initAnimation(animations: AnimationClip[]): void {
    this._idleAction = this._mixer.clipAction(animations.find((a) => a.name === "Armature|Take 001|BaseLayer"));

    this.on('animate', (e) => this._mixer.update(e.delta));
  }

}
