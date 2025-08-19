import { PerspectiveCameraAuto } from "@three.ez/main";
import { Object3D, Vector3 } from "three";

export class GameCamera extends PerspectiveCameraAuto {
  public override name = "GameCamera";
  public targetOffset = new Vector3(0, 6, 6);
  public lookAtOffset = new Vector3(0, 0, -2);

  constructor(target: Object3D) {
    super();
    this.followOwl(target);
  }

  private followOwl(target: Object3D): void {
    const tempPosition = new Vector3();

    this.on('afteranimate', () => {
      tempPosition.copy(target.position);

      this.position.addVectors(tempPosition, this.targetOffset);
      this.lookAt(tempPosition.add(this.lookAtOffset));
    });
  }
}