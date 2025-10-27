import { Box3 } from "three";
import { GameScene } from "../core/scene-game.js";
import { Coin } from "../object/coin.js";
import { Items } from "../object/items.js";
import { Owl } from "../object/owl.js";
import { Pine } from "../object/pine.js";

export class CollisionController {
  private _owl: Owl;
  private _coin: Coin;
  private _scene: GameScene;
  private _pine: Pine;
  private _items: Items;
  private _owlBox = new Box3();

  constructor(scene: GameScene) {
    this._owl = scene.owl;
    this._coin = scene.coin;
    this._pine = scene.pine;
    this._items = scene.items;
    this._scene = scene;
  }

  public update(): void {
    const coin = this._coin;
    const owl = this._owl;
    const pine = this._pine;
    const items = this._items;
    const owlBox = this._owlBox;

    owlBox.copy(owl.collider);
    owlBox.translate(owl.position);

    coin.bvh.intersectBox(owlBox, (instanceIndex) => {
      if (coin.getVisibilityAt(instanceIndex)) { // TODO improve
        coin.dispatchEvent({ type: 'collision', instanceIndex });
      }
      return false;
    });

    if (this._scene.isUsingRocket) return;

    pine.bvh.intersectBox(owlBox, (instanceIndex) => {
      //TODO: fix dts 
      this._scene.dispatchEvent({ type: 'gameover' } as any);
      return true; // stop checking other pines, it's game over
    });

    items.bvh.intersectBox(owlBox, (instanceIndex) => {
      items.dispatchEvent({ type: 'collision' as any, instanceIndex });
      return true;
    });
  }
}
