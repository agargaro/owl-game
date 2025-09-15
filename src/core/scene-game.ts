import { AmbientLight, DirectionalLight, Fog, Scene } from "three";
import { CollisionController } from "../controller/collision-controller.js";
import { acceleration, cameraFar, maxSpeed } from "../data/config.js";
import { Coin } from "../object/coin.js";
import { Items } from "../object/items.js";
import { Owl } from "../object/owl.js";
import { Pine } from "../object/pine.js";
import { Terrain } from "../object/terrain.js";
import { GameCamera } from "./camera-game.js";
import { ItemController } from "../controller/item-controller.js";

export class GameScene extends Scene {
  public override name = "Scene-Game";
  public owl = new Owl();
  public coin = new Coin();
  public pine = new Pine();
  public items = new Items();
  public camera = new GameCamera(this.owl);
  public collisionController = new CollisionController(this);
  public itemController = new ItemController(this);
  public ambientLight = new AmbientLight('white', 0.5);
  public directionalLight = new DirectionalLight('white', 2.5);

  constructor() {
    super();

    this.add(this.directionalLight, this.directionalLight.target, this.ambientLight, this.owl, this.coin, this.pine, this.items);

    const dirLight = this.directionalLight;
    const shadowCamera = dirLight.shadow.camera;
    dirLight.position.set(0, 10, 0);
    dirLight.castShadow = true;
    shadowCamera.left = -3;
    shadowCamera.right = 3;
    shadowCamera.top = 40;
    shadowCamera.bottom = 0;
    shadowCamera.updateProjectionMatrix();
    dirLight.shadow.mapSize.set(256, 1024);
    dirLight.shadow.bias = -0.0001;
    dirLight.shadow.normalBias = -0.0001;

    this.fog = new Fog(0x8EB65D, 20, cameraFar);
    this.background = this.fog.color;

    this.on('beforeanimate', (e) => {
      this.timeScale = Math.min(maxSpeed, this.timeScale + e.delta * acceleration);
    });

    this.on('afteranimate', () => {
      const depth = this.camera.position.z;
      this.directionalLight.position.setZ(depth);
      this.directionalLight.target.position.setZ(depth);

      this.collisionController.update();
    });

    // test TODO add asset
    this.add(new Terrain());
  }
}
