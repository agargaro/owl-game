import { Color, Scene, Vector3 } from "three";
import { Owl } from "../object/owl.js";

export class NewScene extends Scene {
    public override name = "New-Game";
    public owlA = new Owl(this, []); // TODO ADD_ACCESORIES
    public owlB = new Owl(this, []);  // TODO ADD_ACCESORIES

    constructor() {
        super();
        this.add(
            this.owlA,
            this.owlB
        );
    }
}
