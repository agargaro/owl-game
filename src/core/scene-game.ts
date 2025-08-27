import { AmbientLight, DirectionalLight, Fog, Scene } from "three";
import { CollisionManager } from "../controller/collision-controller.js";
import { Coin } from "../object/coin.js";
import { Owl } from "../object/owl.js";
import { Pine } from "../object/pine.js";
import { Terrain } from "../object/terrain.js";
import { GameCamera } from "./camera-game.js";
import { acceleration, maxSpeed } from "../data/config.js";

export class GameScene extends Scene {
  public override name = "Scene-Game";
  public owl = new Owl();
  public coin = new Coin();
  public pine = new Pine();
  public camera = new GameCamera(this.owl);
  public collisionManager = new CollisionManager(this);
  public ambientLight = new AmbientLight('white', 2);
  public directionalLight = new DirectionalLight('white', 1.5);

  constructor() {
    super();

    this.fog = new Fog(0x8EB65D, 20, 25);

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
