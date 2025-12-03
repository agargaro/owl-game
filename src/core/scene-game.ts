import { Color, DirectionalLight, Fog, HemisphereLight, Scene} from "three";
import { CollisionController } from "../controller/collision-controller.js";
import { acceleration, cameraFar, maxSpeed } from "../data/config.js";
import { Coin } from "../object/coin.js";
import { Items } from "../object/items.js";
import { Owl } from "../object/owl.js";
import { Pine } from "../object/pine.js";
import { Terrain } from "../object/terrain.js";
import { GameCamera } from "./camera-game.js";
import { ItemController } from "../controller/item-controller.js";
import { SpawnController } from "../controller/spawn-controller.js";
import {GameMode} from "../types/game.js";
import {Tree} from "../object/tree.js";

export class GameScene extends Scene {
  public override name = "Scene-Game";
  public gameMode: GameMode = "normal";
  public tree = new Tree();
  public owl = new Owl();
  public coin = new Coin();
  public pine = new Pine();
  public items = new Items();
  public terrain = new Terrain();
  public camera = new GameCamera(this.owl);
  public collisionController = new CollisionController(this);
  public spawnController = new SpawnController(this);
  public itemController = new ItemController(this);
  public ambientLight = new HemisphereLight('white', 'blue', 1);
  public directionalLight = new DirectionalLight('white', 2.5);
  public isUsingRocket = false;
  public lastTimeScale = 0;

  constructor() {
    super();

    this.add(this.directionalLight, this.directionalLight.target, this.ambientLight, this.owl, this.tree);

    this.setupLight();

    this.fog = new Fog(0x8EB65D, 20, cameraFar);
    this.background = new Color(0x080d1b);

  }

  public setGameMode(mode: GameMode) {
      this.gameMode = mode
      console.log('SetGameMode:', mode);
      if(mode === "flight") {
          this.startFlight();
      }
  };

  private startFlight(){
      this.background = this.fog.color;
      this.add(this.coin, this.pine, this.items, this.terrain);
      this.on('beforeanimate', (e) => {
          this.timeScale = Math.min(maxSpeed, this.timeScale + e.delta * acceleration);
      });

      this.owl.on('beforeanimate', (e) => {
          this.owl.translateZ(e.delta * 10 * (this.isUsingRocket ? 2 : 1));
      });

      this.on('afteranimate', () => {
          const depth = this.camera.position.z;
          this.directionalLight.position.setZ(depth);
          this.directionalLight.target.position.setZ(depth);

          if (this.scene.timeScale > 0) {
              this.collisionController.update();
          }
      });
      this.owl.startFlight();
      this.camera.startFlight();
      this.directionalLight.position.set(0, 10, 0);
  }

  private setupLight(): void {
    const dirLight = this.directionalLight;
    const shadowCamera = dirLight.shadow.camera;
    dirLight.position.set(5, 10, 0);
    dirLight.castShadow = true;
    shadowCamera.left = -3;
    shadowCamera.right = 3;
    shadowCamera.top = 40;
    shadowCamera.bottom = 0;
    shadowCamera.updateProjectionMatrix();
    dirLight.shadow.mapSize.set(256, 1024);
    dirLight.shadow.bias = -0.0001;
    dirLight.shadow.normalBias = -0.0001;
  }
}
