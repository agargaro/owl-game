import { PerspectiveCameraAuto } from "@three.ez/main";
import { Object3D, Vector3 } from "three";
import { cameraFar } from "../data/config.js";

export class GameCamera extends PerspectiveCameraAuto {
  public override name = "GameCamera";
  public targetOffset = new Vector3(0, 4, 4);
  public lookAtOffset = new Vector3(0, 0, -3);
  private _target: Object3D;
  constructor(target: Object3D) {
    super(50, 0.1, cameraFar);
    this._target = target;
    this.position.set(0, 0, 5);
    this.lookAt(0, 0, 0);
  }
  public startFlight(): void {
    this.followOwl(this._target);
  }
  private followOwl(target: Object3D): void {
    const tempPosition = new Vector3();

    this.on('animate', () => {
      tempPosition.copy(target.position);

      this.position.addVectors(tempPosition, this.targetOffset);
      this.lookAt(tempPosition.add(this.lookAtOffset));
    });
  }
}