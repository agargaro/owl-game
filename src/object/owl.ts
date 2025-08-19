import { get, preload } from "@three.ez/asset-manager";
import { AnimationAction, AnimationClip, AnimationMixer, Group } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import { lerp } from "three/src/math/MathUtils.js";
import { owlFlyHeight, playableWidth } from "../data/config.js";

preload(GLTFLoader, "owl.glb");
export class Owl extends Group {
  public override name = "Owl";
  private _mixer = new AnimationMixer(this);
  private _flyAction: AnimationAction;

  constructor() {
    super();
    this.position.y = owlFlyHeight;
    this.rotation.y = Math.PI;
    this.scale.divideScalar(15);

    const gltf = get<GLTF>("owl.glb");
    this.add(...gltf.scene.children);

    this.initAnimation(gltf.animations);
    this._flyAction.play();

    this.bindInteraction();

    this.on('beforeanimate', (e) => {
      this.translateZ(e.delta * 5);
    });

  }

  private initAnimation(animations: AnimationClip[]): void {
    this._flyAction = this._mixer.clipAction(animations.find((a) => a.name === "Flight"));

    this.on('animate', (e) => this._mixer.update(e.delta));
  }

  private bindInteraction(): void {
    let idealPosition = 0;
    const halfPlayableWidth = playableWidth / 2;

    window.addEventListener("pointermove", (e) => {
      const pointer = e.clientX / window.innerWidth;
      idealPosition = pointer * playableWidth - halfPlayableWidth;
    });

    this.on("animate", (e) => {
      const t = 1 - 0.001 ** e.delta;
      this.position.x = lerp(this.position.x, idealPosition, t);
      this.rotation.z = -(this.position.x - idealPosition) * e.delta * 40;
    });
  }
}
