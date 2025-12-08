import { AudioLoader, AudioListener, Audio } from 'three';
import {get, preload} from "@three.ez/asset-manager";

// TODO use three.ez/asset
preload(AudioLoader, 'audio/main.mp3');
preload(AudioLoader, 'audio/wind.mp3');
preload(AudioLoader, 'audio/tree.mp3');
preload(AudioLoader, 'audio/rocket.mp3');
preload(AudioLoader, 'audio/coin1.mp3');
preload(AudioLoader, 'audio/coin2.mp3');
preload(AudioLoader, 'audio/coin3.mp3');

export class AudioUtils {
    public static audioListener = new AudioListener();

    public static rocketSound: Audio;
    public static coinSound: Audio[] = new Array(10);
    public static coinSoundIndex = 0;
    public static treeSound: Audio;

    public static mainThemeAudio: Audio;
    public static windAudio: Audio;

    public static init() {
        const main = get<AudioBuffer>('audio/main.mp3');
        this.mainThemeAudio = new Audio(this.audioListener).setBuffer(main);
        this.mainThemeAudio.setVolume(0.03);
        this.mainThemeAudio.setLoop(true);

        const wind = get<AudioBuffer>('audio/wind.mp3');
        this.windAudio = new Audio(this.audioListener).setBuffer(wind);
        this.windAudio.setVolume(0.05);
        this.windAudio.setLoop(true);

        const tree = get<AudioBuffer>('audio/tree.mp3')
        this.treeSound = new Audio(this.audioListener).setBuffer(tree);
        this.treeSound.setVolume(0.1);

        const rocket = get<AudioBuffer>('audio/rocket.mp3');
        this.rocketSound = new Audio(this.audioListener).setBuffer(rocket);
        this.rocketSound.setVolume(0.05);

        const coinFiles = [
            'audio/coin1.mp3',
            'audio/coin2.mp3',
            'audio/coin3.mp3'
        ];
        let sounds: Audio[] = new Array(3);
        let loadedIndex = 0;
        coinFiles.forEach((file, index) => {
            const buffer = get<AudioBuffer>(file);
            sounds[index] = new Audio(this.audioListener).setBuffer(buffer);
            loadedIndex++;
            if (loadedIndex === coinFiles.length) {
                for (let i = 0; i < 10; i++) {
                    const sound = sounds[Math.floor(Math.random() * 3)];
                    sound.setVolume(0.1)
                    this.coinSound[i] = sound
                }
            }
        });
    }
}