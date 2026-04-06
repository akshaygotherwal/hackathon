export function buildDigitalTwin(habits) {

    const avgSleep =
        habits.reduce((a, b) => a + b.sleep_hours, 0) / habits.length;

    const avgWater =
        habits.reduce((a, b) => a + b.water_intake, 0) / habits.length;

    const avgSteps =
        habits.reduce((a, b) => a + b.steps, 0) / habits.length;

    return {
        sleep_avg: avgSleep,
        water_avg: avgWater,
        steps_avg: avgSteps
    };
}