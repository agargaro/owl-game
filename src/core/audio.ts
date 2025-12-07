import { AudioLoader, AudioListener, Audio } from 'three';

// TODO use three.ez/asset

export class AudioUtils {
    public static audioLoader = new AudioLoader();
    public static audioListener = new AudioListener();

    public static rocketSound: Audio;
    public static coinSound: Audio[] = new Array(10);
    public static coinSoundIndex = 0;
    public static treeSound: Audio;

    public static mainThemeAudio: Audio;
    public static windAudio: Audio;

    public static init() {
        this.audioLoader.load('audio/main.mp3', (buffer) => {
            this.mainThemeAudio = new Audio(this.audioListener).setBuffer(buffer);
            this.mainThemeAudio.setVolume(0.03);
            this.mainThemeAudio.setLoop(true);
            this.mainThemeAudio.play();
        });

        this.audioLoader.load('audio/wind.mp3', (buffer) => {
            this.windAudio = new Audio(this.audioListener).setBuffer(buffer);
            this.windAudio.setVolume(0.05);
            this.windAudio.setLoop(true);
            this.windAudio.play();
        });
        this.audioLoader.load('audio/tree.mp3', (buffer) => {
            this.treeSound = new Audio(this.audioListener).setBuffer(buffer);
            this.treeSound.setVolume(0.1);
        });

        this.audioLoader.load('audio/rocket.mp3', (buffer) => {
            this.rocketSound = new Audio(this.audioListener).setBuffer(buffer);
            this.rocketSound.setVolume(0.05);
        });

        const coinFiles = [
            'audio/coin1.mp3',
            'audio/coin2.mp3',
            'audio/coin3.mp3'
        ];
        let sounds: Audio[] = new Array(3);
        let loadedIndex = 0;
        coinFiles.forEach((file, index) => {
            this.audioLoader.load(file, (buffer) => {
                sounds[index] = new Audio(this.audioListener).setBuffer(buffer);
                loadedIndex++;
                if (loadedIndex === coinFiles.length) {
                    for (let i = 0; i < 10; i++) {
                        const sound = sounds[Math.floor(Math.random() * 3)];
                        sound.setVolume(0.2)
                        this.coinSound[i] = sound
                    }
                }
            });
        });
    }
}