import { GameScene } from "../core/scene-game.js";

export class ItemController {
  private _scene: GameScene;

  constructor(scene: GameScene) {
    this._scene = scene;
    this.bindItemEvents();
  }

  private bindItemEvents(): void {
    const scene = this._scene;
    const items = scene.items;

    items.addEventListener('active' as any, (e) => { // TODO fix d.ts
      // const itemIndex = e.itemIndex; // we have only rocket here
      scene.isUsingRocket = true;
      // const itemPosition = items.getPositionAt(0); // 0 because only one item for now
      scene.spawnController.spawnCoinsItem(scene.owl.position);
    });
  }
}
