export class PreloaderOverlay {
    private overlay: HTMLDivElement;
    private progressBar: HTMLDivElement;

    constructor() {
        this.overlay = document.createElement("div");
        Object.assign(this.overlay.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            background: "#000",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            zIndex: "9999",
        });

        this.progressBar = document.createElement("div");
        Object.assign(this.progressBar.style, {
            width: "0%",
            height: "4px",
            background: "#0af",
            transition: "width 0.2s",
        });

        const container = document.createElement("div");
        Object.assign(container.style, {
            width: "80%",
            height: "4px",
            background: "#222",
            marginTop: "10px",
        });

        container.appendChild(this.progressBar);

        this.overlay.appendChild(container);
        document.body.appendChild(this.overlay);
    }

    public setProgress(ratio: number) {
        this.progressBar.style.width = `${Math.round(ratio * 100)}%`;
        if(ratio === 1) this.hide();
    }

    public hide() {
        this.overlay.style.opacity = "0";
        this.overlay.style.transition = "opacity 0.5s";
        setTimeout(() => this.overlay.remove(), 500);
    }
}