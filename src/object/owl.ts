import { get, preload, remove } from "@three.ez/asset-manager";
import {
    AnimationAction, AnimationClip, AnimationMixer, Box3, Color,
    Group, Mesh, MeshBasicMaterial, MeshLambertMaterial,
    MeshPhongMaterial, Scene, Texture,
} from "three";
import { GLTF, GLTFLoader, KTX2Loader, SkeletonUtils } from "three/examples/jsm/Addons.js";
import { lerp } from "three/src/math/MathUtils.js";
import { AudioUtils } from "../core/audio.js";
import { cdnBaseUrl, owlFlyHeight, playableWidth } from "../data/config.js";
import { VirtualJoystick } from "../ui/virtual-joystick.js";
import { GameScene } from "../core/scene-game.js";

preload(GLTFLoader, "models/owl.glb");
preload(KTX2Loader,
    `${cdnBaseUrl}/textures/owl/Owl_Brown.ktx2`,
    `${cdnBaseUrl}/textures/owl/Owl_Normal.ktx2`,
    `${cdnBaseUrl}/textures/eyes/Owl_Eyes_Brown.ktx2`
);
export class Owl extends Group {
    public override name = "Owl";
    public readonly collider = new Box3();
    private readonly _joystick = new VirtualJoystick();
    private readonly _mixer = new AnimationMixer(this);
    private _flyAction: AnimationAction;
    private _idleAction: AnimationAction;
    private _scene: Scene;

    constructor(scene: Scene, accesories: string[] = []) {
        super();
        this._scene = scene;
        this.renderOrder = 0;
        this.frustumCulled = false;
        const gltf = get<GLTF>("models/owl.glb");
        this.add(...SkeletonUtils.clone(gltf.scene).children);
        this.position.y = -0.5;
        this.position.z = 0.4;
        this.scale.divideScalar(12);
        this.applyAccesories(accesories);
        this.initAnimation(gltf.animations);
        this._idleAction.fadeIn(.2).play();
        this.collider.setFromObject(this);

        // remove("models/owl.glb",
        //     `${cdnBaseUrl}/textures/owl/Owl_Brown.ktx2`,
        //     `${cdnBaseUrl}/textures/owl/Owl_Normal.ktx2`,
        //     `${cdnBaseUrl}/textures/eyes/Owl_Eyes_Brown.ktx2`
        // ); // TODO put in the package
    }

    public startFlight(): void {
        this._idleAction.fadeOut(.2).stop();
        this._flyAction.fadeIn(.2).play();
        this.bindInteraction();

        this.scale.divideScalar(1.5);
        this.rotation.y = Math.PI;
        this.collider.setFromObject(this);
        this.position.y = owlFlyHeight;
        this.position.z = -10;
    }

    public applyAccesories(accesories: string[]): void {
        const map = get<Texture>(`${cdnBaseUrl}/textures/owl/Owl_Brown.ktx2`);
        const eyeMap = get<Texture>(`${cdnBaseUrl}/textures/eyes/Owl_Eyes_Brown.ktx2`);
        const normalMap = get<Texture>('textures/owl-normal.ktx2');

        this.traverse((child) => {
            if (!child.name.includes("Owl")) {
                if (!accesories.includes(child.name))
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
            let material: MeshPhongMaterial | MeshBasicMaterial | MeshLambertMaterial;
            switch (child.name) {
                case "Owl_Eyes_low":
                    material = new MeshLambertMaterial({ map: eyeMap, fog: false });
                    break;
                case "Owl_Bliks_low":
                    material = new MeshBasicMaterial({ color: new Color("#ccc") });
                    break;
                case "Owl_low":
                    material = new MeshPhongMaterial({ map: map, normalMap: normalMap });
                    console.log(mesh);

                    break;
                default:
                    break;
            }

            mesh.material = material;
        });
    }

    private initAnimation(animations: AnimationClip[]): void {
        this._flyAction = this._mixer.clipAction(animations.find((a) => a.name === "Flight"));
        this._idleAction = this._mixer.clipAction(animations.find((a) => a.name === "Idle"));

        this.on('beforeanimate', (e) => this._mixer.update(e.delta));
    }

    private bindInteraction(): void {
        let idealPosition = 0;
        let idealRotation = 0;
        let targetVolume = 0.05;
        let lastDirectionX = 0;
        const halfPlayableWidth = playableWidth / 2;
        this._joystick.connect(document as unknown as HTMLElement);
        this._joystick.addEventListener('move', (event: { direction: { x: number, y: number }, force: number }) => {
            const dirX = event.direction.x * event.force;
            idealPosition = dirX * halfPlayableWidth;
            idealRotation = -(this.position.x - idealPosition) * 0.2;
            if (Math.sign(dirX) !== Math.sign(lastDirectionX) && Math.abs(dirX) > 0.1) {
                targetVolume = 0.1;
                setTimeout(() => {
                    targetVolume = 0.05;
                }, 100);
            }
            lastDirectionX = dirX;
        });
        this._joystick.addEventListener('release', () => {
            idealPosition = 0;
            idealRotation = -(this.position.x * 0.2);
            targetVolume = 0.05;
            lastDirectionX = 0;
        });
        this.on("animate", (e) => {
            if (!(this._scene as GameScene).isFlying) return;
            const t = 1 - 0.001 ** e.delta;
            this.position.x = lerp(this.position.x, idealPosition, t);
            this.rotation.z = lerp(idealRotation, 0, t);
            idealRotation = this.rotation.z;
            const currentVolume = AudioUtils.windAudio.getVolume();
            AudioUtils.windAudio.setVolume(lerp(currentVolume, targetVolume, t));
        });
    }
}
