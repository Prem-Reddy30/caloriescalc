const mapProfileToMongoUser = (sqlProfile) => {
  if (!sqlProfile) return null;
  return {
    id: sqlProfile.id,
    _id: sqlProfile.id,
    name: sqlProfile.name,
    email: sqlProfile.email,
    role: sqlProfile.role,
    createdAt: sqlProfile.created_at,
    profile: {
      age: sqlProfile.age,
      gender: sqlProfile.gender,
      height: sqlProfile.height,
      weight: sqlProfile.weight,
      activityLevel: sqlProfile.activity_level,
      goal: sqlProfile.goal,
      dietaryPreference: sqlProfile.dietary_preference,
      budget: sqlProfile.budget ? parseFloat(sqlProfile.budget) : 200,
      calorieGoal: sqlProfile.calorie_goal || 2000
    }
  };
};

module.exports = { mapProfileToMongoUser };
