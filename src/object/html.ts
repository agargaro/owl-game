// @ts-ignore
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import {
    Camera,
    Vector3
} from "three";
import {GameScene} from "../core/scene-game.js";
import {Quarks} from "../core/quarks.js";
import {PerspectiveCameraAuto} from "@three.ez/main";

export class Html2D {
    private renderer2D: CSS2DRenderer;
    private scene: GameScene;
    private camera: Camera;
    private readonly _needsOffset = new Vector3(0, .4, 0);
    private _owlPxBox: Record<string, number> = { width: 0, height: 0 };
    private _containers: CSS2DObject[] = [];

    constructor(scene: GameScene, camera: Camera) {
        this.scene = scene;
        this.camera = camera;

        this.renderer2D = new CSS2DRenderer();
        this.renderer2D.setSize(window.innerWidth, window.innerHeight);
        this.renderer2D.domElement.style.position = "absolute";
        this.renderer2D.domElement.style.top = "0";
        this.renderer2D.domElement.style.pointerEvents = "none";
        this.renderer2D.domElement.style.zIndex = "10";
        document.body.appendChild(this.renderer2D.domElement);
        this.scene.on('viewportresize', () => {
            this.renderer2D.setSize(window.innerWidth, window.innerHeight)
            this._getObjectScreenSize()
            for (const obj of this._containers) {
                obj.element.style.width = `${this._owlPxBox.width}px`;
                obj.element.style.height = `${this._owlPxBox.height}px`;
            }
        });
    }

    public addNeeds() {
        const targetPos = this.scene.owl.position.clone();
        this._getObjectScreenSize();
        const container = document.createElement("div");
        container.className = 'owl-container';
        container.style.width = `${this._owlPxBox.width}px`;
        container.style.height = `${this._owlPxBox.height}px`;
        container.style.pointerEvents = 'none';

        const owlCollider = document.createElement("div");
        owlCollider.className = 'owl-collider';
        container.appendChild(owlCollider);

        const bubble = document.createElement("div");
        bubble.className = 'needs';
        bubble.textContent = 'Fly';
        container.appendChild(bubble);

        owlCollider.addEventListener('click', () => {
            if (this.scene.gameMode === 'flight') return;
            Quarks.play('QuestionsMark', { position: new Vector3(0,0.2,0), scale: 0.14 });
        });
        bubble.addEventListener('click', () => {
            if (this.scene.gameMode === 'flight') return;
            this.scene.setGameMode('flight');
        });
        const obj = new CSS2DObject(container);
        obj.position.copy(targetPos).add(this._needsOffset);

        this.scene.add(obj);

        this._containers.push(obj);
        return obj;
    }

    public render() {
        this.renderer2D.render(this.scene, this.camera);
    }

    private _getObjectScreenSize() {
        const rendererWidth = window.innerWidth;
        const rendererHeight = window.innerHeight;
        const collider = this.scene.owl.collider;
        const camera = this.camera as PerspectiveCameraAuto;
        const center = collider.getCenter(new Vector3());
        const size = collider.getSize(new Vector3());

        const distance = center.clone().sub(camera.position).length();

        const vFOV = camera.fov * (Math.PI/180);
        const screenHeightUnits = 2 * Math.tan(vFOV/2) * distance;
        const screenWidthUnits = screenHeightUnits * (rendererWidth/rendererHeight);

        const widthPx = size.x / screenWidthUnits * rendererWidth;
        const heightPx = size.y / screenHeightUnits * rendererHeight;

        this._owlPxBox = { width: widthPx, height: heightPx };
    }
}

