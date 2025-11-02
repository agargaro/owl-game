import { GameScene } from "../core/scene-game.js";
import { GameStats } from "./game-stats.js";
import { getMaxRockets } from "../data/rocket-service.js";
import { getHighScore } from "../data/highscore-service.js";

const ROCKET_BUTTON_BACKGROUNDS = {
    idle: 'transparent',
    hover: 'rgba(255,255,255,0.08)',
    active: 'rgba(255,255,255,0.12)',
} as const;

type RocketButtonVisualState = keyof typeof ROCKET_BUTTON_BACKGROUNDS;

export class GameHUD {
    public gameStats: GameStats;
    public gameOverModal: HTMLDivElement;
    private currentScoreValueEl?: HTMLSpanElement;
    private bestScoreValueEl?: HTMLSpanElement;
    private rocketButton?: HTMLButtonElement;
    private rocketCounterEl?: HTMLDivElement;
    private rocketsLeft = 0;
    private rocketButtonDisabled = false;

    constructor(private scene: GameScene) {
        this._initHUD();
    }

    public onGameOver(): void {
        const currentScore = this.gameStats.getCurrentScore();
        const newRecord = this.gameStats.consumeNewHighScoreFlag();
        const bestScore = getHighScore();
        this._updateGameOverStats(currentScore, bestScore);
        this.scene.lastTimeScale = this.scene.timeScale;
        this.scene.timeScale = 0;
        this.gameOverModal.style.top = "0dvh";
    }

    private _initHUD() {
        this.gameStats = new GameStats(this.scene);
        this._bindSceneEvents();
        this._createGameOverModal();
        this._updateGameOverStats(0, getHighScore());
    }

    private _bindSceneEvents() {
        this.scene.addEventListener('gameover' as any, () => this.onGameOver());
    }

    private _createGameOverModal() {
        this.gameOverModal = document.createElement("div");
        this._applyModalStyles(this.gameOverModal);

        this._addTitle(this.gameOverModal, "GAME\nOVER");

        const statsSummary = this._createStatsSummary();
        this.gameOverModal.appendChild(statsSummary);

        const rocketButton = this._createRocketButton();
        this.gameOverModal.appendChild(rocketButton);

        const restartButton = this._createRestartButton();
        this.gameOverModal.appendChild(restartButton);

        this._addDivider(this.gameOverModal, restartButton);

        document.body.appendChild(this.gameOverModal);
    }

    private _applyModalStyles(modal: HTMLDivElement) {
        Object.assign(modal.style, {
            position: "fixed",
            top: "-100dvh",
            left: "0",
            width: "100dvw",
            height: "100dvh",
            display: "flex",
            gap: "20px",
            transition: "top 500ms ease-in",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            backgroundColor: "rgba(0, 0, 0)",
            color: "white",
            fontFamily: '"Pixelify Sans", sans-serif',
            fontSize: "48px"
        });
    }

    private _addTitle(modal: HTMLDivElement, text: string) {
        const title = document.createElement("div");
        title.style.whiteSpace = "pre-line";
        title.style.fontWeight = "500";
        title.style.fontSize = "64px";
        title.style.lineHeight = "1.1";
        title.style.marginBottom = "20%";
        title.innerText = text;
        modal.appendChild(title);
    }

    private _createRocketButton(): HTMLButtonElement {
        const button = document.createElement("button");
        this._applyPrimaryButtonStyles(button);
        button.setAttribute('aria-label', 'Launch rocket');
        button.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="32px" height="32px" viewBox="0 0 512 512" aria-hidden="true">
                    <path d="M477.64,38.26a4.75,4.75,0,0,0-3.55-3.66c-58.57-14.32-193.9,36.71-267.22,110a317,317,0,0,0-35.63,42.1c-22.61-2-45.22-.33-64.49,8.07C52.38,218.7,36.55,281.14,32.14,308a9.64,9.64,0,0,0,10.55,11.2L130,309.57a194.1,194.1,0,0,0,1.19,19.7,19.53,19.53,0,0,0,5.7,12L170.7,375a19.59,19.59,0,0,0,12,5.7,193.53,193.53,0,0,0,19.59,1.19l-9.58,87.2a9.65,9.65,0,0,0,11.2,10.55c26.81-4.3,89.36-20.13,113.15-74.5,8.4-19.27,10.12-41.77,8.18-64.27a317.66,317.66,0,0,0,42.21-35.64C441,232.05,491.74,99.74,477.64,38.26ZM294.07,217.93a48,48,0,1,1,67.86,0A47.95,47.95,0,0,1,294.07,217.93Z"/>
                    <path d="M168.4,399.43c-5.48,5.49-14.27,7.63-24.85,9.46-23.77,4.05-44.76-16.49-40.49-40.52,1.63-9.11,6.45-21.88,9.45-24.88a4.37,4.37,0,0,0-3.65-7.45,60,60,0,0,0-35.13,17.12C50.22,376.69,48,464,48,464s87.36-2.22,110.87-25.75A59.69,59.69,0,0,0,176,403.09C176.37,398.91,171.28,396.42,168.4,399.43Z"/>
                </svg>
                <span>Use Rocket</span>
            </div>
            <div id="rocket-counter" style="font-size:16px;opacity:0.85;"> 0 / 3</div>
        `;

        this.rocketButton = button;
        const counterEl = button.querySelector('#rocket-counter') as HTMLDivElement | null;
        if (counterEl) {
            this.rocketCounterEl = counterEl;
        }

        this._refreshRocketButtonState();

        getMaxRockets()
            .then((remoteMax) => {
                this.rocketsLeft = Math.min(3, Math.max(0, remoteMax || 0));
                this._refreshRocketButtonState();
            })
            .catch(() => {
                this.rocketsLeft = 1;
                this._refreshRocketButtonState();
            });

        button.onclick = (e) => {
            e.stopPropagation();
            if (this.rocketButtonDisabled || this.rocketsLeft <= 0) return;

            this._setRocketButtonBackground('active');
            setTimeout(() => this._refreshRocketButtonState(), 120);

            this.rocketsLeft -= 1;
            document.dispatchEvent(new CustomEvent('roket', { detail: { from: 'game-over-rocket-button', rocketsRemaining: this.rocketsLeft } }));
            this._refreshRocketButtonState();

            this.gameOverModal.style.top = "-100dvh";
            this.scene.timeScale = this.scene.lastTimeScale;
            this.scene.items.dispatchEvent({ type: 'active' as any }); // TODO fix d.ts
        };

        button.onmouseenter = () => {
            if (!button.disabled) this._setRocketButtonBackground('hover');
        };
        button.onmouseleave = () => this._refreshRocketButtonState();

        return button;
    }

    private _refreshRocketButtonState() {
        if (!this.rocketButton) return;
        const button = this.rocketButton;
        const disabled = this.rocketButtonDisabled || this.rocketsLeft <= 0;

        button.disabled = disabled;
        button.style.opacity = disabled ? '0.5' : '1';
        button.style.cursor = disabled ? 'not-allowed' : 'pointer';
        button.style.borderColor = disabled ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.9)';
        button.setAttribute('aria-disabled', String(disabled));
        this._setRocketButtonBackground('idle');

        if (this.rocketCounterEl) {
            this.rocketCounterEl.innerText = `${Math.max(0, this.rocketsLeft)} / 3`;
            this.rocketCounterEl.style.color =
                this.rocketsLeft === 0 ? "rgba(255,100,100,0.85)" :
                    this.rocketsLeft === 1 ? "rgba(255,200,100,0.95)" :
                        "rgba(255,255,255,0.9)";
        }
    }

    private _setRocketButtonBackground(state: RocketButtonVisualState) {
        if (!this.rocketButton) return;
        this.rocketButton.style.background = ROCKET_BUTTON_BACKGROUNDS[state];
    }

    private _applyPrimaryButtonStyles(button: HTMLButtonElement) {
        Object.assign(button.style, {
            background: "transparent",
            border: "2px dashed rgba(255,255,255,0.9)",
            color: "white",
            padding: "12px 20px",
            cursor: "pointer",
            fontSize: "20px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: "20px",
            borderRadius: "30px",
            transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
            fontFamily: '"Pixelify Sans", sans-serif'
        });
    }

    private _createRestartButton(): HTMLButtonElement {
        const button = document.createElement("button");
        Object.assign(button.style, {
            background: "transparent",
            border: "0px",
            borderBottomWidth: "1.5px",
            color: "rgba(255,255,255)",
            padding: "10px 20px",
            cursor: "pointer",
            fontSize: "18px",
            fontFamily: '"Pixelify Sans", sans-serif',
            transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
            borderRadius: "30px"
        });
        button.innerText = "Retry";

        button.onmouseenter = () => {
            button.style.background = "rgba(255,255,255,0.08)";
            button.style.color = "rgba(255,255,255,0.9)";
        };
        button.onmouseleave = () => {
            button.style.background = "transparent";
            button.style.color = "rgba(255,255,255,0.5)";
        };
        button.onclick = () => window.location.reload();

        return button;
    }

    private _addDivider(modal: HTMLDivElement, beforeEl: HTMLElement) {
        const divider = document.createElement("div");
        divider.innerText = "or";
        Object.assign(divider.style, {
            color: "rgba(255,255,255,0.75)",
            opacity: "0.75",
            fontSize: "16px",
            marginBottom: "-15px",
            letterSpacing: "0.5px",
            fontFamily: '"Pixelify Sans", sans-serif',
            userSelect: "none"
        });
        modal.insertBefore(divider, beforeEl);
    }

    private _createStatsSummary(): HTMLDivElement {
        const wrapper = document.createElement("div");
        Object.assign(wrapper.style, {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            fontSize: "18px",
            width: "min(320px, 80dvw)",
            color: "rgba(255,255,255,0.9)",
            marginBottom: "8px"
        });

        const [scoreRow, scoreValueEl] = this._createSummaryRow("Score");
        const [bestRow, bestValueEl] = this._createSummaryRow("Best");

        this.currentScoreValueEl = scoreValueEl;
        this.bestScoreValueEl = bestValueEl;

        wrapper.appendChild(scoreRow);
        wrapper.appendChild(bestRow);

        return wrapper;
    }

    private _createSummaryRow(label: string): [HTMLDivElement, HTMLSpanElement] {
        const row = document.createElement("div");
        Object.assign(row.style, {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "24px",
            width: "100%",
            padding: "8px 16px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "999px"
        });

        const labelEl = document.createElement("span");
        labelEl.innerText = label;
        Object.assign(labelEl.style, {
            opacity: "0.75",
            fontSize: "16px",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            flex: "1",
            textAlign: "left"
        });

        const valueEl = document.createElement("span");
        valueEl.innerText = "00";
        Object.assign(valueEl.style, {
            fontSize: "28px",
            fontWeight: "600",
            letterSpacing: "0.08em",
            minWidth: "88px",
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
            fontFeatureSettings: "'tnum'"
        });

        row.appendChild(labelEl);
        row.appendChild(valueEl);

        return [row, valueEl];
    }

    private _updateGameOverStats(currentScore: number, bestScore: number) {
        if (this.currentScoreValueEl) {
            this.currentScoreValueEl.innerText = currentScore.toString().padStart(2, '0');
        }
        if (this.bestScoreValueEl) {
            this.bestScoreValueEl.innerText = bestScore.toString().padStart(2, '0');
        }
    }
}
