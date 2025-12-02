import { get, preload, remove } from "@three.ez/asset-manager";
import { AnimationAction, AnimationClip, AnimationMixer, Box3, Group, Mesh, MeshLambertMaterial, Texture } from "three";
import { GLTF, GLTFLoader, KTX2Loader } from "three/examples/jsm/Addons.js";
import { lerp } from "three/src/math/MathUtils.js";
import { owlFlyHeight, playableWidth } from "../data/config.js";
import { VirtualJoystick } from "../ui/virtual-joystick.js";

preload(GLTFLoader, "models/owl.glb");
preload(KTX2Loader, "textures/owl-brown.ktx2", "textures/owl-normal.ktx2");
export class Owl extends Group {
  public override name = "Owl";
  public readonly collider = new Box3();
  private readonly _joystick = new VirtualJoystick();
  private readonly _mixer = new AnimationMixer(this);
  private _flyAction: AnimationAction;
  private _idleAction: AnimationAction;

  constructor() {
    super();
    this.renderOrder = 0;
    this.frustumCulled = false;

    const gltf = get<GLTF>("models/owl.glb");
    this.add(...gltf.scene.children);

    this.scale.divideScalar(10);
    this.applyAccesories();
    this.initAnimation(gltf.animations);
    this._idleAction.fadeIn(.2).play();
    remove("models/owl.glb", "textures/owl-brown.ktx2", "textures/owl-normal.ktx2"); // TODO put in the package
  }

  public startFlight(): void {
    this._idleAction.fadeOut(.2).stop();
    this._flyAction.fadeIn(.2).play();
    this.bindInteraction();

    this.scale.divideScalar(1.5);
    this.rotation.y = Math.PI;
    this.collider.setFromObject(this);
    this.position.y = owlFlyHeight;
    this.position.z = -15; // to wait 3 seconds before obstacles spawn
  }

  private applyAccesories(): void {
    const map = get<Texture>("textures/owl-brown.ktx2");
    const normalMap = get<Texture>('textures/owl-normal.ktx2');

    this.traverse((child) => {
      if (!child.name.includes("Owl")) {
        child.visible = false;
      } else {
        // TODO refactor
        const material = (child as Mesh).material as MeshLambertMaterial;
        if (material) {
          material.map = map;
          material.normalMap = normalMap;
          // child.castShadow = true;
        }
      }
    });
  }

  private initAnimation(animations: AnimationClip[]): void {
    this._flyAction = this._mixer.clipAction(animations.find((a) => a.name === "Flight"));
    this._idleAction = this._mixer.clipAction(animations.find((a) => a.name === "Idle"));

    this.on('animate', (e) => this._mixer.update(e.delta));
  }

  private bindInteraction(): void {
    let idealPosition = 0;
    let idealRotation = 0;
    const halfPlayableWidth = playableWidth / 2;

    this._joystick.connect(document as unknown as HTMLElement);

    this._joystick.addEventListener('move', (event: { direction: { x: number, y: number }, force: number }) => { // TODO signature
      idealPosition = event.direction.x * event.force * halfPlayableWidth;
      idealRotation = -(this.position.x - idealPosition) * 0.2;
    });
    this._joystick.addEventListener('release', (event) => {
      idealPosition = 0;
      idealRotation = -(this.position.x * 0.2);
    });

    this.on("animate", (e) => {
      const t = 1 - 0.001 ** e.delta;
      this.position.x = lerp(this.position.x, idealPosition, t);
      this.rotation.z = lerp(idealRotation, 0, t);
      idealRotation = this.rotation.z;
    });
  }
}
