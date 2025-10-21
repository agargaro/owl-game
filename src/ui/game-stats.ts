import { GameScene } from "../core/scene-game.js";
import { getHighScore, registerScore } from "../data/highscore-service.js";

export class GameStats {
    private scoreValueEl!: HTMLDivElement;
    private highScoreValueEl!: HTMLDivElement;
    private container!: HTMLDivElement;
    private secondaryContainer!: HTMLDivElement;
    private currentScore = 0;
    private achievedNewHighScore = false;
    private bestScoreRecorded = 0;
    private newRecordBanner?: HTMLDivElement;
    private newRecordTimeout?: number;
    private scoreLabelEl?: HTMLDivElement;

    constructor(game: GameScene) {
        this._initializeHud(game);
    }

    private _initializeHud(game: GameScene) {
        this._createHud();
        this.bestScoreRecorded = getHighScore();
        this._updateScoreDisplay(0);
        this._updateHighScoreDisplay(this.bestScoreRecorded);
        game.coin.addEventListener('collected', (e) => {
            this.updateCoinCount(e.count);
        });
    }

    private _createHud() {
        this.container = this._buildPrimaryContainer();
        this.secondaryContainer = this._buildSecondaryContainer();

        const scoreWrapper = this._buildScoreSection();
        const highScoreWrapper = this._buildHighScoreSection();
        this.newRecordBanner = this._buildNewRecordBanner();

        this.container.appendChild(scoreWrapper);
        this.secondaryContainer.appendChild(highScoreWrapper);
        this.secondaryContainer.appendChild(this.newRecordBanner);

        document.body.appendChild(this.container);
        document.body.appendChild(this.secondaryContainer);
    }

    private _buildPrimaryContainer(): HTMLDivElement {
        const container = document.createElement('div');
        this._applyContainerBaseStyles(container);
        return container;
    }

    private _buildSecondaryContainer(): HTMLDivElement {
        const container = document.createElement('div');
        this._applyContainerBaseStyles(container);
        container.style.left = '10px';
        container.style.right = 'auto';
        return container;
    }

    private _applyContainerBaseStyles(container: HTMLDivElement) {
        Object.assign(container.style, {
            position: 'fixed',
            top: '10px',
            right: '10px',
            color: 'white',
            fontFamily: '"Pixelify Sans", sans-serif',
            fontOpticalSizing: 'auto',
            fontSize: '24px',
            zIndex: '1000',
            display: 'flex',
            gap: '8px',
            flexDirection: 'column',
        });
    }

    private _buildScoreSection(): HTMLDivElement {
        const scoreWrapper = document.createElement('div');
        Object.assign(scoreWrapper.style, {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px'
        });

        const scoreLabelEl = document.createElement('div');
        scoreLabelEl.innerText = 'Score';
        Object.assign(scoreLabelEl.style, {
            fontSize: '16px',
            opacity: '0.75',
            letterSpacing: '0.08em',
        });
        this.scoreLabelEl = scoreLabelEl;
        scoreWrapper.appendChild(scoreLabelEl);

        const scoreValueRow = document.createElement('div');
        Object.assign(scoreValueRow.style, {
            display: 'flex',
            alignItems: 'flex-start',
        });

        const coinIcon = this._createCoinIcon();
        Object.assign(coinIcon.style, {
            marginRight: '-3px',
            marginTop: '-3px',
        });
        scoreValueRow.appendChild(coinIcon);

        this.scoreValueEl = document.createElement('div');
        this.scoreValueEl.id = 'coin-container';
        Object.assign(this.scoreValueEl.style, {
            fontSize: '26px',
            lineHeight: '1',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: "'tnum'"
        });
        scoreValueRow.appendChild(this.scoreValueEl);

        scoreWrapper.appendChild(scoreValueRow);
        return scoreWrapper;
    }

    private _buildHighScoreSection(): HTMLDivElement {
        const wrapper = document.createElement('div');
        Object.assign(wrapper.style, {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '4px',
            minWidth: '80px'
        });

        const label = document.createElement('div');
        label.innerText = 'Best';
        Object.assign(label.style, {
            fontSize: '16px',
            opacity: '0.75',
            letterSpacing: '0.08em',
        });
        wrapper.appendChild(label);

        this.highScoreValueEl = document.createElement('div');
        Object.assign(this.highScoreValueEl.style, {
            fontSize: '26px',
            lineHeight: '1'
        });
        wrapper.appendChild(this.highScoreValueEl);

        return wrapper;
    }

    private _buildNewRecordBanner(): HTMLDivElement {
        const banner = document.createElement('div');
        banner.innerText = 'New record!';
        Object.assign(banner.style, {
            display: 'none',
            padding: '4px 10px',
            borderRadius: '999px',
            background: 'rgba(255,215,120,0.15)',
            border: '1px solid rgba(255,215,120,0.65)',
            color: 'rgba(255,235,160,0.95)',
            fontSize: '12px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase'
        });
        return banner;
    }

    private _createCoinIcon() {
        const img = document.createElement('img');
        img.src = 'coin.gif';
        img.style.width = '32px';
        img.style.height = '32px';
        img.style.verticalAlign = 'middle';
        return img;
    }

    public updateCoinCount(count: number) {
        this._updateScoreDisplay(count);
        const bestAfter = registerScore(count);

        if (bestAfter > this.bestScoreRecorded) {
            this.achievedNewHighScore = true;
            this.bestScoreRecorded = bestAfter;
            this._showNewRecordBanner();
        } else {
            this.bestScoreRecorded = Math.max(this.bestScoreRecorded, bestAfter);
        }

        this._updateHighScoreDisplay(bestAfter);
    }

    private _updateScoreDisplay(count: number) {
        this.currentScore = count;
        if (!this.scoreValueEl) return;
        this.scoreValueEl.innerText = count.toString().padStart(2, '0');
    }

    private _updateHighScoreDisplay(best: number) {
        if (!this.highScoreValueEl) return;
        this.highScoreValueEl.innerText = best.toString().padStart(2, '0');
    }

    public getCurrentScore(): number {
        return this.currentScore;
    }

    public consumeNewHighScoreFlag(): boolean {
        const wasNew = this.achievedNewHighScore;
        this.achievedNewHighScore = false;
        return wasNew;
    }

    private _showNewRecordBanner() {
        if (!this.newRecordBanner) return;
        this.newRecordBanner.style.display = 'flex';
        if (this.newRecordTimeout !== undefined) {
            window.clearTimeout(this.newRecordTimeout);
        }
        this.newRecordTimeout = window.setTimeout(() => {
            if (this.newRecordBanner) {
                this.newRecordBanner.style.display = 'none';
            }
            this.newRecordTimeout = undefined;
        }, 2500);
    }
}