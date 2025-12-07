import {Color, Scene} from "three";
import { CollisionController } from "../controller/collision-controller.js";
import { acceleration, maxSpeed } from "../data/config.js";
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
import {PineMeadow} from "../object/pineMeadow.js";
import {TreeMeadow} from "../object/treeMeadow.js";
import {SkyBox} from "../object/skyBox.js";
import {Environment} from "../object/environment.js";
import {DayTimeController} from "../controller/daytime-controller.js";

export class GameScene extends Scene {
  public override name = "Scene-Game";
  public gameMode: GameMode = "normal";
  public tree = new Tree();
  public owl = new Owl();
  public coin = new Coin();
  public pine = new Pine();
  public items = new Items();
  public terrain = new Terrain();
  public pineMeadow = new PineMeadow();
  public treeMeadow = new TreeMeadow();
  public skyBox = new SkyBox();
  public env = new Environment();
  public camera = new GameCamera(this.owl);
  public collisionController = new CollisionController(this);
  public spawnController = new SpawnController(this);
  public itemController = new ItemController(this);
  public dayTimeController = new DayTimeController(this);
  public isUsingRocket = false;
  public lastTimeScale = 0;

  constructor() {
    super();
    this.add(
        this.env.hemiLight,
        this.env.directionalLight,
        this.env.directionalLight.target,
        this.owl,
        this.tree,
        this.pineMeadow,
        this.treeMeadow,
        this.skyBox
    );
    this.fog = this.env.fog;
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
      this.env.setFlight(true, this.dayTimeController.cycle);
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
          this.env.directionalLight.position.setZ(depth);
          this.env.directionalLight.target.position.setZ(depth);

          if (this.scene.timeScale > 0) {
              this.collisionController.update();
          }
      });

      this.pineMeadow.visible = false;
      this.treeMeadow.visible = false;
      this.skyBox.visible = false;
      this.owl.startFlight();
      this.camera.startFlight();
      this.env.directionalLight.position.set(0, 10, 0);
  }
}
