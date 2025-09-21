import { MathUtils } from "three";
import { GameScene } from "../core/scene-game.js";
import { cellSize, chunkRows, owlFlyHeight } from "../data/config.js";
import { Coin } from "../object/coin.js";
import { Items } from "../object/items.js";
import { Owl } from "../object/owl.js";
import { Pine } from "../object/pine.js";
import { Terrain } from "../object/terrain.js";
import { Bucket } from "../utils/bucket.js";
import { rand } from "../utils/random.js";

export class SpawnController {
  private _owl: Owl;
  private _terrain: Terrain;
  private _coin: Coin;
  private _pine: Pine;
  private _items: Items;
  private _chunkId = 0;
  private _colSpawnBucket = new Bucket([-1, 0, 1]);

  constructor(scene: GameScene) {
    this._owl = scene.owl;
    this._coin = scene.coin;
    this._pine = scene.pine;
    this._items = scene.items;
    this._terrain = scene.terrain;
  }

  public generateChunk(): void {
    const coin = this._coin;
    const pine = this._pine;
    const chunkId = this._chunkId++;
    const bucket = this._colSpawnBucket;

    // TODO add item

    this._terrain.generateChunk(chunkId);

    for (let i = chunkId * chunkRows / cellSize, l = (chunkId + 1) * chunkRows / cellSize; i < l; i++) {
      const obstacleCount = i % 4 == 0 ? rand(1, 2) : 0;
      const coinCount = MathUtils.clamp(rand(3) - obstacleCount, 1, 2); // if 1 obstacle, 25% change of 2 cois

      pine.addInstances(obstacleCount, (obj) => {
        const colIndex = bucket.pop();
        obj.position.set(colIndex, 0, -i * cellSize);
      });

      coin.addInstances(coinCount, (obj) => {
        const colIndex = bucket.pop();
        obj.position.set(colIndex * 2, owlFlyHeight, -i * cellSize);
        obj.scale.divideScalar(1.5); // TODO
      });

      bucket.clear();
    }
  }
}
