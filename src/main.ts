import { getLoader, loadPending } from '@three.ez/asset-manager';
import { extendBatchedMeshPrototype } from '@three.ez/batched-mesh-extensions';
import { Main } from '@three.ez/main';
import { PCFShadowMap } from 'three';
import { DRACOLoader, GLTFLoader, KTX2Loader } from 'three/examples/jsm/Addons.js';
import { GameScene } from './core/scene-game.js';
import { GameHUD } from './ui/game-hud.js';
import { AudioUtils } from './core/audio.js';

extendBatchedMeshPrototype();

const main = new Main({ showStats: true, enableCursor: false, rendererParameters: { antialias: false } });

main.renderer.shadowMap.enabled = true;
main.renderer.shadowMap.type = PCFShadowMap;

const gltfLoader = getLoader(GLTFLoader);
gltfLoader.setDRACOLoader(new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/libs/draco/gltf/'));

const ktx2Loader = getLoader(KTX2Loader);
ktx2Loader.setTranscoderPath('https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/libs/basis/');
ktx2Loader.detectSupport(main.renderer);

AudioUtils.init();
await loadPending();

const scene = new GameScene();
new GameHUD(scene);

main.createView({ scene, camera: scene.camera, enabled: false });

main.renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio)); // todo put it in three.ez
