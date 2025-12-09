import {Box3, Vector2, Vector3} from "three";
import { GameScene } from "../core/scene-game.js";
import { Coin } from "../object/coin.js";
import { Items } from "../object/items.js";
import { Owl } from "../object/owl.js";
import { Pine } from "../object/pine.js";
import { AudioUtils } from "../core/audio.js";
import {Quarks} from "../core/quarks.js";

export class CollisionController {
  private _owl: Owl;
  private _coin: Coin;
  private _scene: GameScene;
  private _pine: Pine;
  private _items: Items;
  private _owlBox = new Box3();
  private _tmpVec = new Vector3();

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
    if (!this._scene.isFlying) return;

    owlBox.copy(owl.collider);
    owlBox.translate(owl.position);

    coin.bvh.intersectBox(owlBox, (instanceIndex) => {
      if (coin.getVisibilityAt(instanceIndex)) { // TODO improve
        coin.dispatchEvent({ type: 'collision', instanceIndex });
      }

      AudioUtils.coinSound[AudioUtils.coinSoundIndex].stop();
      AudioUtils.coinSound[AudioUtils.coinSoundIndex].play();
      AudioUtils.coinSoundIndex = (AudioUtils.coinSoundIndex + 1) % 10;
      return false;
    });

    if (this._scene.isUsingRocket) return;

    pine.bvh.intersectBox(owlBox, (instanceNumber) => {
      Quarks.play("Bang",  {
          position: pine.getPositionAt(instanceNumber).clone().add(new Vector3(0, 2, 0.5)),
          scale: .5,
      });
      this._scene.dispatchEvent({ type: 'gameover' } as any);
      // TODO pause render
      return true; // stop checking other pines, it's game over
    });

    items.bvh.intersectBox(owlBox, (instanceIndex) => {
      items.dispatchEvent({ type: 'collision' as any, instanceIndex });
      AudioUtils.rocketSound.play();
      return true;
    });
  }
}
