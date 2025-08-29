import { get, preload } from "@three.ez/asset-manager";
import { AnimationAction, AnimationClip, AnimationMixer, Box3, Group } from "three";
import { GLTF, GLTFLoader, KTX2Loader } from "three/examples/jsm/Addons.js";
import { lerp } from "three/src/math/MathUtils.js";
import { owlFlyHeight, playableWidth } from "../data/config.js";
import { VirtualJoystick } from "../ui/virtual-joystick.js";

preload(GLTFLoader, "owl.glb");
preload(KTX2Loader, "owl-brown.ktx2", "owl-normal.ktx2");
export class Owl extends Group {
  public override name = "Owl";
  public readonly collider = new Box3();
  private readonly _mixer = new AnimationMixer(this);
  private readonly _flyAction: AnimationAction;
  private readonly _joystick = new VirtualJoystick();

  constructor() {
    super();
    this.renderOrder = 0;

    const gltf = get<GLTF>("owl.glb");
    this.add(...gltf.scene.children);

    this.removeAccesories();

    this.rotation.y = Math.PI;
    this.scale.divideScalar(15);
    this.collider.setFromObject(this);
    this.position.y = owlFlyHeight;

    this.initAnimation(gltf.animations);
    this._flyAction.play();

    this.bindInteraction();

    this.on('beforeanimate', (e) => {
      this.translateZ(e.delta * 10);
    });
  }

  private removeAccesories(): void {
    const map = get("owl-brown.ktx2");
    const normalMap = get('owl-normal.ktx2');

    this.traverse((child) => {
      if (!child.name.includes("Owl")) {
        child.visible = false;
      } else {
        // TODO refactor
        if (child.material) {
          child.material.map = map;
          child.material.normalMap = normalMap;
          child.castShadow = true;
        }
      }
    });
  }

  private initAnimation(animations: AnimationClip[]): void {
    this._flyAction = this._mixer.clipAction(animations.find((a) => a.name === "Flight"));

    this.on('animate', (e) => this._mixer.update(e.delta));
  }

  private bindInteraction(): void {
    let idealPosition = 0;
    const halfPlayableWidth = playableWidth / 2;

    this._joystick.connect(document as unknown as HTMLElement);

    this._joystick.addEventListener('move', (event: { direction: { x: number, y: number }, force: number }) => { // TODO signature
      idealPosition = event.direction.x * event.force * halfPlayableWidth;
      this.rotation.z = -(this.position.x - idealPosition) * 0.2;
    });

    this.on("animate", (e) => {
      const t = 1 - 0.001 ** e.delta;
      this.position.x = lerp(this.position.x, idealPosition, t);
      this.rotation.z = lerp(this.rotation.z, 0, t * 0.2);
    });
  }
}
