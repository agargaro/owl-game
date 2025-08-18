import { Group, Mesh, MeshLambertMaterial, PlaneGeometry } from "three";

export class Ground extends Group {
  public override name = "Ground";

  constructor() {
    super();

    const plane = new Mesh(new PlaneGeometry(2000, 2000), new MeshLambertMaterial({ color: 0x00ff00 }));
    plane.rotateX(Math.PI / -2);
    this.add(plane);
  }
}
