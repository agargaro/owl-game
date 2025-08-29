import { AmbientLight, DirectionalLight, Fog, Scene } from "three";
import { CollisionManager } from "../controller/collision-controller.js";
import { Coin } from "../object/coin.js";
import { Owl } from "../object/owl.js";
import { Pine } from "../object/pine.js";
import { Terrain } from "../object/terrain.js";
import { GameCamera } from "./camera-game.js";
import { acceleration, cameraFar, maxSpeed } from "../data/config.js";

export class GameScene extends Scene {
  public override name = "Scene-Game";
  public owl = new Owl();
  public coin = new Coin();
  public pine = new Pine();
  public camera = new GameCamera(this.owl);
  public collisionManager = new CollisionManager(this);
  public ambientLight = new AmbientLight('white', 1);
  public directionalLight = new DirectionalLight('white', 3).translateZ(10).translateY(5);

  constructor() {
    super();

    const dirLight = this.directionalLight;

    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.top = 30;
    dirLight.shadow.camera.bottom = 0;
    dirLight.shadow.bias = -0.0001;
    dirLight.shadow.normalBias = -0.0001;
    dirLight.shadow.camera.updateProjectionMatrix();
    dirLight.shadow.blurSamples = 4;


    this.fog = new Fog(0x8EB65D, 20, cameraFar);
    this.background = this.fog.color;

    this.on('beforeanimate', (e) => {
      this.timeScale = Math.min(maxSpeed, this.timeScale + e.delta * acceleration);
    });

    this.on('afteranimate', () => this.collisionManager.update());

    this.add(this.ambientLight, this.owl, this.coin, this.pine);
    this.camera.add(this.directionalLight, this.directionalLight.target);

    // test TODO add asset
    this.add(new Terrain());
  }
}
