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
  private readonly _moon: Mesh;
  private readonly _sky: Mesh;
  constructor() {
    super();
    this.renderOrder = 0;
    this.frustumCulled = false;

    const skyGeo = new PlaneGeometry(30,30);
    const skyMat = new SkyMaterial();
    const skyMesh = new Mesh(skyGeo, skyMat);
    this._sky = skyMesh;

    const moonGeo = new PlaneGeometry(10,10);
    const moonTex = get<Texture>('textures/moon.ktx2')
    const moonMat = new MeshBasicMaterial({map: moonTex, fog: false, transparent: true, blending: AdditiveBlending});
    const moonMesh = new Mesh(moonGeo, moonMat);
    this._moon = moonMesh;

    this.add(skyMesh)
    this.add(moonMesh)
    this.position.set(0,5,-30);
    remove('textures/moon.ktx2');
  }

  private _updateMoon(cycle: number){
     const moon = this._moon;
     moon.position.set(-5 * (Math.cos(1.2 - cycle) + 0.1), 5.0 * (0.3 - cycle), 0.01);
     moon.scale.setScalar(Math.sin(1 - cycle) + 0.3);
     if (moon.material instanceof Material) {
         moon.material.opacity = 1 - cycle;
     }
  }

    private _updateSkyMaterial(cycle: number) {
        const mat = this._sky.material;
        if (mat instanceof SkyMaterial) {
            mat.updateDayTime(cycle);
        }
    }

  public updateDayTime(cycle: number){
      this._updateMoon(cycle);
      this._updateSkyMaterial(cycle)
  }
}
