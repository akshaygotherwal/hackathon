import { calculateHealthScore } from "./healthScoreEngine.js";

export function simulateFuture(currentTwin, changes) {

    const simulated = {
        sleep_hours: changes.sleep || currentTwin.sleep_avg,
        water_intake: changes.water || currentTwin.water_avg,
        steps: changes.steps || currentTwin.steps_avg,
        meal_regularity: 3
    };

    const predictedScore = calculateHealthScore(simulated);

    return {
        predictedScore,
        simulated
    };
}