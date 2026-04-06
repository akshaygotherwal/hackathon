export function generateInsight(data, score) {

    if (score > 80) {
        return "Your lifestyle habits are balanced. Keep maintaining hydration, sleep, and activity levels.";
    }

    if (score > 60) {
        return "Your health habits are moderate. Improving sleep and hydration could boost your daily energy.";
    }

    return "Your lifestyle habits may need improvement. Focus on better sleep, hydration, and regular activity.";
}