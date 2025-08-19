import { Box3 } from "three";
import { GameScene } from "../core/scene-game.js";
import { Coin } from "../object/coin.js";
import { Owl } from "../object/owl.js";
import { Pine } from "../object/pine.js";

export class CollisionManager {
  private _owl: Owl;
  private _coin: Coin;
  private _pine: Pine;

  constructor(scene: GameScene) {
    this._owl = scene.owl;
    this._coin = scene.coin;
    this._pine = scene.pine;
  }

  public update(): void {
    const coin = this._coin;
    const owl = this._owl;
    const pine = this._pine;

    owl.updateMatrixWorld();

    const owlBox = new Box3().setFromObject(owl); // precompute it TODO

    coin.bvh.intersectBox(owlBox, (instanceIndex) => {
      coin.dispatchEvent({ type: 'collision', instanceIndex });
      return true;
    });

    pine.bvh.intersectBox(owlBox, (instanceIndex) => {
      pine.dispatchEvent({ type: 'collision', instanceIndex });
      return true;
    });
  }
}