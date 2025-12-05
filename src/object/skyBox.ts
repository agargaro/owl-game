import {
    AdditiveBlending,
    Group, Material, Mesh, MeshBasicMaterial, PlaneGeometry, Texture
} from "three";
import {SkyMaterial} from "../material/SkyMaterial.js";
import {preload, remove, get} from "@three.ez/asset-manager";
import {KTX2Loader} from "three/examples/jsm/Addons.js";

preload(KTX2Loader,
    `textures/moon.ktx2`,
);

export class SkyBox extends Group {
  public override name = "SkyBox";
  private _cycle  = 1;
  private _moon: Mesh;
  constructor() {
    super();
    this.renderOrder = 0;
    this.frustumCulled = false;
    const cycle = this._cycle;

    const skyGeo = new PlaneGeometry(30,30);
    const skyMat = new SkyMaterial(cycle);
    const skyMesh = new Mesh(skyGeo, skyMat);

    const moonGeo = new PlaneGeometry(10,10);
    const moonTex = get<Texture>('textures/moon.ktx2')
    const moonMat = new MeshBasicMaterial({map: moonTex, fog: false, transparent: true, blending: AdditiveBlending});
    const moonMesh = new Mesh(moonGeo, moonMat);
    moonMesh.position.set(-3,2, 1);
    this._moon = moonMesh;
    this._updateMoon();

    this.add(skyMesh)
    this.add(moonMesh)
    this.position.set(0,5,-30);
    remove('textures/moon.ktx2');
  }

  private _updateMoon(){
     const cycle = this._cycle;
     this._moon.position.set(-5 * (Math.cos(1.2 - cycle) + 0.1), 5.0 * (0.3 - cycle), 0.01);
     this._moon.scale.setScalar(Math.sin(1 - cycle) + 0.3);
     if (this._moon.material instanceof Material) {
         this._moon.material.opacity = 1 - this._cycle;
     }
  }

  public updateCycle(cycle: number){
      this._cycle = cycle;
  }
}
