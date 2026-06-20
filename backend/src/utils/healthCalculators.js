function calculateBMR(gender, weight, height, age) {
  if (gender === 'male') {
    return Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
  } else {
    return Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
  }
}

function calculateTDEE(bmr, activityLevel) {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
}

function calculateCalorieGoal(tdee, goal) {
  const adjustments = {
    loss: -500,
    maintenance: 0,
    lean_bulk: 300,
    muscle_gain: 500
  };
  return tdee + (adjustments[goal] || 0);
}

function calculateWaterIntake(weight, activityLevel) {
  const baseIntake = weight * 0.035;
  const activityMultiplier = {
    sedentary: 1,
    light: 1.15,
    moderate: 1.3,
    active: 1.45,
    very_active: 1.6
  };
  return Math.round((baseIntake * (activityMultiplier[activityLevel] || 1)) * 10) / 10;
}

module.exports = {
  calculateBMR,
  calculateTDEE,
  calculateCalorieGoal,
  calculateWaterIntake
};
