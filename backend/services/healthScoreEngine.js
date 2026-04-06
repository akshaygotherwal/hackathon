export function calculateHealthScore(data) {
    const sleepScore = data.sleep_hours >= 8 ? 100 : data.sleep_hours * 12;

    const hydrationScore =
        data.water_intake >= 3 ? 100 : data.water_intake * 30;

    const activityScore =
        data.steps >= 8000 ? 100 : (data.steps / 8000) * 100;

    const mealScore = data.meal_regularity * 25;

    const total =
        sleepScore * 0.3 +
        hydrationScore * 0.25 +
        activityScore * 0.25 +
        mealScore * 0.2;

    return Math.round(total);
}