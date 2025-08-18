import { Box3 } from "three";
import { GameScene } from "../core/scene-game.js";
import { Coin } from "../object/coin.js";
import { Owl } from "../object/owl.js";

export class CollisionManager {
  private _owl: Owl;
  private _coin: Coin;

  constructor(scene: GameScene) {
    this._owl = scene.owl;
    this._coin = scene.coin;
  }

  public update(): void {
    const coin = this._coin;
    const owl = this._owl;

    owl.updateMatrixWorld();

    const owlBox = new Box3().setFromObject(owl); // precompute it TODO

    coin.bvh.intersectBox(owlBox, (instanceIndex) => {
      coin.removeInstances(instanceIndex);
      coin.dispatchEvent({ type: 'collision', instanceIndex });
      return true;
    });
  }
}