import { MathUtils } from "three";
import { GameScene } from "../core/scene-game.js";
import { cellSize, changeChunkDistance, chunkRows, owlFlyHeight, treeSpawnRatio } from "../data/config.js";
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
        this.generateChunk(true);
      }
    });
  }

  private generateStartingChunks(): void {
    for (let i = 0; i < this._terrain.maxInstanceCount; i++) {
      this._chunkCoinInstances.push([]);
      this._chunkPineInstances.push([]);
      const spawnObjects = i > 0; // no objects on first 2 chunks
      this.generateChunk(spawnObjects);
    }
  }

  private generateChunk(spawnObjects: boolean): void {
    const coin = this._coin;
    const pine = this._pine;
    const chunkId = this._chunkId++;
    const bucket = this._colSpawnBucket;

    // TODO add item

    const geometryIndex = rand((this._terrain as any)._geometryCount - 1); // TODO fix cast
    const instanceId = this._terrain.generateChunk(geometryIndex, chunkId);

    if (!spawnObjects) return;

    const coinInstances = this._chunkCoinInstances[instanceId];
    const pineInstances = this._chunkPineInstances[instanceId];
    coinInstances.length = 0;
    pineInstances.length = 0;

    for (let i = chunkId * chunkRows / cellSize, l = (chunkId + 1) * chunkRows / cellSize; i < l; i++) {
      const obstacleCount = (i % treeSpawnRatio == 0) && !this.hasWater(geometryIndex, i) ? rand(1, 2) : 0;
      const coinCount = MathUtils.clamp(rand(3) - obstacleCount, 1, 2); // if 1 obstacle, 25% change of 2 coins

      pine.addInstances(obstacleCount, (obj, index) => {
        const colIndex = bucket.pop();
        obj.position.set(colIndex * cellSize, 0, -i * cellSize);
        obj.scale.divideScalar(4.5);
        obj.rotateX(Math.PI / -2);
        pineInstances.push(index);
      });

      coin.addInstances(coinCount, (obj, index) => {
        const colIndex = bucket.pop();
        obj.position.set(colIndex * cellSize, owlFlyHeight, -i * cellSize);
        obj.scale.divideScalar(1.5);
        coinInstances.push(index);
      });

      bucket.clear();
    }
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

  // this can be improved
  private hasWater(geometryIndex: number, rowIndex: number): boolean {
    if (geometryIndex === 3) {
      if (rowIndex % (chunkRows / 2) === 5) return true;
    } else if (geometryIndex === 4) {
      if (rowIndex % (chunkRows / 2) === 5) return true;
      if (rowIndex % (chunkRows / 2) === 15) return true;
    } else if (geometryIndex === 5) {
      if (rowIndex % (chunkRows / 2) === 10) return true;
    }
    return false;
  }
}
