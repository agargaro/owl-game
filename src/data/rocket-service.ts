// Mocked rocket service - returns max rockets allowed for the player
export function getMaxRockets(): Promise<number> {
    // Simulate async fetch with a small delay
    return new Promise((resolve) => {
        setTimeout(() => resolve(5), 120);
    });
}