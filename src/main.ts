import { getLoader, loadPending } from '@three.ez/asset-manager';
import { Main } from '@three.ez/main';
import { DRACOLoader, GLTFLoader } from 'three/examples/jsm/Addons.js';
import { GameScene } from './core/scene-game.js';

const main = new Main({ showStats: false });

const gltfLoader = getLoader(GLTFLoader);
gltfLoader.setDRACOLoader(new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/libs/draco/gltf/'));
await loadPending();

const scene = new GameScene();

main.createView({ scene, camera: scene.camera, enabled: false });
