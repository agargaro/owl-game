import { AmbientLight, DirectionalLight, FogExp2, Scene } from "three";
import { CollisionManager } from "../controller/collision-controller.js";
import { Coin } from "../object/coin.js";
import { Ground } from "../object/ground.js";
import { Owl } from "../object/owl.js";
import { GameCamera } from "./camera-game.js";
import { Pine } from "../object/pine.js";

export class GameScene extends Scene {
  public owl = new Owl();
  public coin = new Coin();
  public pine = new Pine();
  public camera = new GameCamera(this.owl);
  public collisionManager = new CollisionManager(this);
  public ambientLight = new AmbientLight();
  public directionalLight = new DirectionalLight();

  constructor() {
    super();

    this.fog = new FogExp2('gray', 0.05);

    this.on('afteranimate', (e) => this.collisionManager.update());

    this.add(this.ambientLight, this.owl, this.coin, this.pine);
    this.camera.add(this.directionalLight, this.directionalLight.target);

    // test TODO add asset
    this.add(new Ground());
  }
}
