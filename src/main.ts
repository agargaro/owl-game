import { getLoader, loadPending } from '@three.ez/asset-manager';
import { Main } from '@three.ez/main';
import { PCFSoftShadowMap } from 'three';
import { DRACOLoader, GLTFLoader, KTX2Loader } from 'three/examples/jsm/Addons.js';
import { GameScene } from './core/scene-game.js';

const main = new Main({ showStats: true, enableCursor: false });

main.renderer.shadowMap.enabled = true;
main.renderer.shadowMap.type = PCFSoftShadowMap;

const gltfLoader = getLoader(GLTFLoader);
gltfLoader.setDRACOLoader(new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/libs/draco/gltf/'));

const ktx2Loader = getLoader(KTX2Loader);
ktx2Loader.setTranscoderPath('https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/libs/basis/');
ktx2Loader.detectSupport(main.renderer);

await loadPending();

const scene = new GameScene();

main.createView({ scene, camera: scene.camera, enabled: false });
