const STORAGE_KEY = "owl-game-highscore";

let fallbackHighScore = 0;

const canUseStorage = () => typeof window !== "undefined" && !!window.localStorage;

const normalizeScore = (score: number): number => {
    if (!Number.isFinite(score) || score < 0) return 0;
    return Math.floor(score);
};

export const getHighScore = (): number => {
    if (canUseStorage()) {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return 0;
            const parsed = Number.parseInt(raw, 10);
            if (Number.isNaN(parsed)) return 0;
            fallbackHighScore = normalizeScore(parsed);
            return fallbackHighScore;
        } catch {
            return fallbackHighScore;
        }
    }
    return fallbackHighScore;
};

export const setHighScore = (score: number): number => {
    const normalized = normalizeScore(score);
    fallbackHighScore = Math.max(fallbackHighScore, normalized);

    if (canUseStorage()) {
        try {
            const current = getHighScore();
            const best = Math.max(current, normalized);
            window.localStorage.setItem(STORAGE_KEY, best.toString());
            fallbackHighScore = best;
            return best;
        } catch {
            // Swallow storage errors and use fallback
        }
    }

    return fallbackHighScore;
};

export const registerScore = (score: number): number => {
    const best = getHighScore();
    if (score > best) {
        return setHighScore(score);
    }
    return best;
};
