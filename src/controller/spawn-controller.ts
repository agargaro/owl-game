import { MathUtils } from "three";
import { GameScene } from "../core/scene-game.js";
import { cellSize, changeChunkDistance, chunkRows, owlFlyHeight } from "../data/config.js";
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
  private _lastOwlDepth = 0;
  private _chunkCoinInstances: number[][] = [];
  private _chunkPineInstances: number[][] = [];

  constructor(scene: GameScene) {
    this._owl = scene.owl;
    this._coin = scene.coin;
    this._pine = scene.pine;
    this._items = scene.items;
    this._terrain = scene.terrain;

    this.generateStartingChunks();

    scene.on('afteranimate', () => {
      const owlDepth = this._owl.position.z;

      if (this._lastOwlDepth - owlDepth > changeChunkDistance) {
        this._lastOwlDepth = Math.ceil(owlDepth);
        this.removeChunk();
        this.generateChunk();
      }
    });
  }

  private generateStartingChunks(): void {
    for (let i = 0; i < this._terrain.maxInstanceCount; i++) {
      this._chunkCoinInstances.push([]);
      this._chunkPineInstances.push([]);
      this.generateChunk();
    }
  }

  private generateChunk(): void {
    const coin = this._coin;
    const pine = this._pine;
    const chunkId = this._chunkId++;
    const bucket = this._colSpawnBucket;

    // TODO add item

    const instanceId = this._terrain.generateChunk(chunkId);
    const coinInstances = this._chunkCoinInstances[instanceId];
    const pineInstances = this._chunkPineInstances[instanceId];
    coinInstances.length = 0;
    pineInstances.length = 0;

    for (let i = chunkId * chunkRows / cellSize, l = (chunkId + 1) * chunkRows / cellSize; i < l; i++) {
      const obstacleCount = i % 4 == 0 ? rand(1, 2) : 0;
      const coinCount = MathUtils.clamp(rand(3) - obstacleCount, 1, 2); // if 1 obstacle, 25% change of 2 cois

      pine.addInstances(obstacleCount, (obj, index) => {
        const colIndex = bucket.pop();
        obj.position.set(colIndex * cellSize, 0, -i * cellSize);
        pineInstances.push(index);
      });

      coin.addInstances(coinCount, (obj, index) => {
        const colIndex = bucket.pop();
        obj.position.set(colIndex * cellSize, owlFlyHeight, -i * cellSize);
        obj.scale.divideScalar(1.5); // TODO
        coinInstances.push(index);
      });

      bucket.clear();
    }

    console.log(`${coin.instancesCount} coins, ${pine.instancesCount} pines in chunk ${chunkId}`);
  }

  private removeChunk(): void {
    const coin = this._coin;
    const pine = this._pine;

    const instanceId = this._terrain.removeLastChunk();
    const coinInstances = this._chunkCoinInstances[instanceId];
    const pineInstances = this._chunkPineInstances[instanceId];

    coin.removeInstances(...coinInstances);
    pine.removeInstances(...pineInstances);
  }
}
