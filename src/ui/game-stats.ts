import { Scene } from "three";
import { GameScene } from "../core/scene-game.js";

export class GameStats {

    constructor(game: GameScene) {
        this._createCoinContainer();

        game.coin.addEventListener('collected', (e) => {
            this.updateCoinCount(e.count);
        });
    }

    private _createCoinIcon(container: HTMLDivElement) {
        const img = document.createElement('img');
        img.src = 'coin.gif';
        img.style.width = '32px';
        img.style.height = '32px';
        img.style.verticalAlign = 'middle';
        return img;
    }
    private _createCoinText(container: HTMLDivElement) {
        const coinText = document.createElement('div');
        coinText.id = 'coin-container';
        coinText.innerHTML = '00';
        container.appendChild(coinText);
        return coinText;
    }

    private _createCoinContainer() {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '10px';
        container.style.right = '10px';
        container.style.color = 'white';
        container.style.fontFamily = '"Pixelify Sans", sans-serif';
        container.style.fontOpticalSizing = 'auto';
        container.style.fontSize = '24px';
        container.style.padding = '10px 20px';
        container.style.borderRadius = '10px';
        container.style.zIndex = '1000';
        container.style.display = 'flex';
        container.style.alignItems = 'center';


        container.appendChild(this._createCoinIcon(container));
        container.appendChild(this._createCoinText(container));
        document.body.appendChild(container);
    }

    public updateCoinCount(count: number) {
        const div = document.getElementById('coin-container');
        if (div) {
            div.innerHTML = count.toString();
        }
    }
}