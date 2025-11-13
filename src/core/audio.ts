import { AudioLoader, AudioListener, Audio } from 'three';

// TODO use three.ez/asset

export class AudioUtils {
    public static audioLoader = new AudioLoader();
    public static audioListener = new AudioListener();

    public static treeSoundBuffer: AudioBuffer;
    public static rocketSoundBuffer: AudioBuffer;
    public static coinSoundBuffer: AudioBuffer;

    public static rocketSound: Audio;
    public static coinSound: Audio[] = new Array(50);
    public static coinSoundIndex = 0;
    public static treeSound: Audio;

    public static mainThemeAudio: Audio;

    public static init() {
        this.audioLoader.load('audio/main.mp3', (buffer) => {
            this.mainThemeAudio = new Audio(this.audioListener).setBuffer(buffer);
            this.mainThemeAudio.setVolume(0.2);
            this.mainThemeAudio.setLoop(true);
            this.mainThemeAudio.play();
        });

        this.audioLoader.load('audio/tree.mp3', (buffer) => {
            this.treeSoundBuffer = buffer;
            this.treeSound = new Audio(this.audioListener).setBuffer(buffer);
        });

        this.audioLoader.load('audio/rocket.mp3', (buffer) => {
            this.rocketSoundBuffer = buffer;
            this.rocketSound = new Audio(this.audioListener).setBuffer(buffer);
        });

        this.audioLoader.load('audio/coin.mp3', (buffer) => {
            this.coinSoundBuffer = buffer;

            for (let i = 0; i < 50; i++) {
                this.coinSound[i] = new Audio(this.audioListener).setBuffer(buffer);
            }
        });
    }
}