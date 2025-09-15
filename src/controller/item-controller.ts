import { BatchedMesh, BufferGeometry, Material, Mesh } from "three";
import { GameScene } from "../core/scene-game.js";
import { cellSize, owlFlyHeight } from "../data/config.js";
import { ItemEventMap } from "../data/events.js";
import { Items } from "../object/items.js";

export class ItemController {
  private _scene: GameScene;

  constructor(scene: GameScene) {
    this._scene = scene;
    this.bindItemEvents();
  }

  private bindItemEvents(): void {
    const scene = this._scene;
    const owl = scene.owl;
    const items = scene.items as Mesh<BufferGeometry, Material, ItemEventMap>;
    const coin = scene.coin;
    const pine = scene.pine;

    items.addEventListener('active', (e) => {
      // const itemIndex = e.itemIndex; // we have only rocket here

      // rocket logic
      const spawnPoint = owl.position.z - Math.floor(owl.position.z % cellSize) - 5 * cellSize; // 2 cells after
      scene.collisionController.enabled = false;
      coin.disposeBVH();
      coin.clearInstances();
      coin.addInstances(99, (obj, index) => {
        obj.position.set((index % 3 - 1) * 2, owlFlyHeight, spawnPoint - Math.floor(index / 3) * cellSize);
        obj.scale.divideScalar(1.5); // TODO scale the coin model
      }); // put 99 in config
      coin.computeBVH({ margin: 0.1 });

      pine.disposeBVH();
      pine.clearInstances();

      // (items as Items).bvh = null; // TODO add dispose
      // (items as Items).deleteInstance(); // remove
    });
  }
}
