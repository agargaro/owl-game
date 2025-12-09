import {Color, Scene} from "three";
import { CollisionController } from "../controller/collision-controller.js";
import {acceleration, maxSpeed} from "../data/config.js";
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
import {AudioUtils} from "./audio.js";
import { Quarks } from "./quarks.js";
import {lerp} from "three/src/math/MathUtils.js";

export class GameScene extends Scene {
  public override name = "Scene-Game";
  public gameMode: GameMode = "normal";
  public tree = new Tree();
  public owl = new Owl(this);
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
  public isFlying = false;
  public animatingOwlIn = false

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
   // this.owl.bindClick(this.camera);
   this.on('animate', (e)=> {
       Quarks.update(e.delta);
   })
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
          if(!this.isFlying) return;
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
      AudioUtils.mainThemeAudio.play()
      AudioUtils.windAudio.play(0.5)
      this.env.directionalLight.position.set(0, 10, 0);
      this.items.startFlight(0);
      Quarks.prewarm(['Coin', 'Bang', 'ItemEpicGlow'])
      requestAnimationFrame(() => {
          this.owl.position.z = -10;
          this.animatingOwlIn = true;
          this.camera.animateOwlIn(true);
          this.owl.on('animate', (e) => {
              if(this.isFlying || !this.animatingOwlIn) return;
              const t = Math.min(1, e.total);
              this.owl.position.z = lerp(-10, -15, t);
          })
          setTimeout(()=>{
              this.camera.animateOwlIn(false);
              this.owl.position.z = -15;
              this.isFlying = true;
              this.animatingOwlIn = false;
              this.camera.startFlight();
          }, 3000);
      });
  }
}
