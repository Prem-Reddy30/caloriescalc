function generateSummaryHtml({
  name,
  date,
  weight,
  caloriesConsumed,
  targetCalories,
  waterIntake,
  waterGoal,
  foods = [],
  workoutCompleted
}) {
  const calPct = targetCalories > 0 ? Math.min((caloriesConsumed / targetCalories) * 100, 100) : 0;
  const waterPct = waterGoal > 0 ? Math.min((waterIntake / waterGoal) * 100, 100) : 0;

  const totalProtein = foods.reduce((s, e) => s + (e.protein || 0), 0);
  const totalCarbs = foods.reduce((s, e) => s + (e.carbs || 0), 0);
  const totalFat = foods.reduce((s, e) => s + (e.fat || 0), 0);

  const foodRows = foods.length > 0 
    ? foods.map(f => `
      <tr style="border-bottom: 1px solid #2e2e38;">
        <td style="padding: 10px; font-size: 14px; color: #ffffff;">
          <span style="margin-right: 5px;">${f.emoji || '🍽️'}</span> ${f.name}
        </td>
        <td style="padding: 10px; font-size: 14px; text-align: right; font-weight: bold; color: #f97316;">
          ${f.cal} kcal
        </td>
        <td style="padding: 10px; font-size: 12px; text-align: center; color: #a1a1aa;">
          P: ${f.protein || 0}g | C: ${f.carbs || 0}g | F: ${f.fat || 0}g
        </td>
      </tr>
    `).join('')
    : `
      <tr>
        <td colspan="3" style="padding: 20px; text-align: center; color: #71717a; font-style: italic; font-size: 14px;">
          No food entries logged for today.
        </td>
      </tr>
    `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Daily Summary</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f0f13; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #e4e4e7;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #0f0f13; padding: 20px 10px;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #13131a; border-radius: 16px; border: 1px solid #27272a; overflow: hidden; padding: 30px;">
              <!-- Header -->
              <tr>
                <td>
                  <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <span style="font-size: 12px; font-weight: bold; color: #10b981; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 5px;">Daily Health Summary</span>
                        <h1 style="font-size: 24px; font-weight: bold; color: #ffffff; margin: 0; line-height: 1.2;">Hi, <span style="color: #10b981;">${name}</span> 👋</h1>
                        <p style="font-size: 14px; color: #71717a; margin: 5px 0 0 0;">Here is your nutrition and hydration report for <strong>${date}</strong></p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Spacing -->
              <tr><td style="height: 25px;"></td></tr>

              <!-- Metrics Grid -->
              <tr>
                <td>
                  <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <!-- Calories -->
                      <td width="48%" style="background-color: rgba(249, 115, 22, 0.05); border: 1px solid rgba(249, 115, 22, 0.15); border-radius: 12px; padding: 15px;">
                        <p style="font-size: 12px; color: #a1a1aa; margin: 0 0 5px 0; text-transform: uppercase;">Calories Consumed</p>
                        <h3 style="font-size: 28px; color: #f97316; margin: 0; font-weight: bold;">
                          ${caloriesConsumed} <span style="font-size: 14px; font-weight: normal; color: #a1a1aa;">/ ${targetCalories} kcal</span>
                        </h3>
                        <!-- Progress bar -->
                        <div style="background-color: #27272a; border-radius: 4px; height: 6px; margin-top: 10px; width: 100%; overflow: hidden;">
                          <div style="background-color: #f97316; border-radius: 4px; height: 6px; width: ${calPct}%;"></div>
                        </div>
                        <p style="font-size: 11px; color: #71717a; margin: 5px 0 0 0;">${calPct.toFixed(0)}% of daily target</p>
                      </td>

                      <!-- Spacing -->
                      <td width="4%"></td>

                      <!-- Water -->
                      <td width="48%" style="background-color: rgba(6, 182, 212, 0.05); border: 1px solid rgba(6, 182, 212, 0.15); border-radius: 12px; padding: 15px;">
                        <p style="font-size: 12px; color: #a1a1aa; margin: 0 0 5px 0; text-transform: uppercase;">Water Intake</p>
                        <h3 style="font-size: 28px; color: #06b6d4; margin: 0; font-weight: bold;">
                          ${waterIntake} <span style="font-size: 14px; font-weight: normal; color: #a1a1aa;">/ ${waterGoal} ml</span>
                        </h3>
                        <!-- Progress bar -->
                        <div style="background-color: #27272a; border-radius: 4px; height: 6px; margin-top: 10px; width: 100%; overflow: hidden;">
                          <div style="background-color: #06b6d4; border-radius: 4px; height: 6px; width: ${waterPct}%;"></div>
                        </div>
                        <p style="font-size: 11px; color: #71717a; margin: 5px 0 0 0;">${waterPct.toFixed(0)}% of daily target</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Spacing -->
              <tr><td style="height: 20px;"></td></tr>

              <!-- Secondary Details Row -->
              <tr>
                <td>
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #1a1a24; border-radius: 12px; padding: 15px; border: 1px solid #27272a;">
                    <tr>
                      <td width="33%" style="text-align: center; border-right: 1px solid #2e2e38;">
                        <span style="font-size: 11px; color: #71717a; text-transform: uppercase; display: block; margin-bottom: 2px;">Weight</span>
                        <strong style="font-size: 16px; color: #ffffff;">${weight || '-'} kg</strong>
                      </td>
                      <td width="33%" style="text-align: center; border-right: 1px solid #2e2e38;">
                        <span style="font-size: 11px; color: #71717a; text-transform: uppercase; display: block; margin-bottom: 2px;">Workout Status</span>
                        <strong style="font-size: 14px; color: ${workoutCompleted ? '#10b981' : '#f43f5e'};">
                          ${workoutCompleted ? '💪 Completed' : '❌ Rest Day'}
                        </strong>
                      </td>
                      <td width="33%" style="text-align: center;">
                        <span style="font-size: 11px; color: #71717a; text-transform: uppercase; display: block; margin-bottom: 2px;">Total Macros</span>
                        <strong style="font-size: 12px; color: #a1a1aa;">
                          P: ${totalProtein}g | C: ${totalCarbs}g
                        </strong>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Spacing -->
              <tr><td style="height: 25px;"></td></tr>

              <!-- Food Log Section -->
              <tr>
                <td>
                  <h3 style="font-size: 16px; font-weight: bold; color: #ffffff; margin: 0 0 10px 0; border-bottom: 2px solid #10b981; padding-bottom: 6px; display: inline-block;">Today's Food Log</h3>
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; background-color: #161620; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
                    <thead>
                      <tr style="background-color: #1f1f2e; border-bottom: 1px solid #2e2e38;">
                        <th style="padding: 12px 10px; font-size: 11px; color: #71717a; text-transform: uppercase; text-align: left;">Food Item</th>
                        <th style="padding: 12px 10px; font-size: 11px; color: #71717a; text-transform: uppercase; text-align: right;">Calories</th>
                        <th style="padding: 12px 10px; font-size: 11px; color: #71717a; text-transform: uppercase; text-align: center;">Macros</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${foodRows}
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- Spacing -->
              <tr><td style="height: 30px;"></td></tr>

              <!-- Footer -->
              <tr>
                <td style="border-t: 1px solid #27272a; padding-top: 20px; text-align: center;">
                  <p style="font-size: 12px; color: #71717a; margin: 0;">
                    Keep going strong on your wellness journey! ⚡
                  </p>
                  <p style="font-size: 10px; color: #52525b; margin: 5px 0 0 0;">
                    Sent automatically by NutriBudget AI. You can configure notification settings in the App.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generateOfferHtml({ name }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Special Premium Diet Offer</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f0f13; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #e4e4e7;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #0f0f13; padding: 20px 10px;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #13131a; border-radius: 16px; border: 1px solid #27272a; overflow: hidden; padding: 35px; border-top: 4px solid #f59e0b;">
              <!-- Header -->
              <tr>
                <td style="text-align: center;">
                  <span style="font-size: 11px; font-weight: bold; color: #f59e0b; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 8px;">★ EXCLUSIVE PREMIUM OFFER ★</span>
                  <h1 style="font-size: 26px; font-weight: bold; color: #ffffff; margin: 0; line-height: 1.2;">Get Your Personalized Diet Plan</h1>
                  <p style="font-size: 14px; color: #a1a1aa; margin: 8px 0 0 0;">Hi <strong>${name || 'Fitness Enthusiast'}</strong> 👋, tailormade nutrition plans are now closer than ever!</p>
                </td>
              </tr>

              <!-- Spacing -->
              <tr><td style="height: 25px;"></td></tr>

              <!-- Offer Body -->
              <tr>
                <td style="background-color: rgba(245, 158, 11, 0.03); border: 1px solid rgba(245, 158, 11, 0.15); border-radius: 12px; padding: 20px; text-align: center;">
                  <p style="font-size: 14px; color: #d4d4d8; margin: 0 0 10px 0;">
                    Stop guessing your food portions! Unlock a professionally structured diet plan mapped to your exact stats, fitness goals, preferences, and monthly budget.
                  </p>
                  <div style="margin: 15px 0;">
                    <span style="font-size: 14px; color: #a1a1aa; text-decoration: line-through; margin-right: 10px;">₹499</span>
                    <strong style="font-size: 32px; color: #10b981;">₹99</strong>
                    <span style="font-size: 12px; color: #10b981; font-weight: bold; background-color: rgba(16, 185, 129, 0.1); padding: 3px 8px; border-radius: 999px; margin-left: 10px;">80% OFF</span>
                  </div>
                  <p style="font-size: 11px; color: #71717a; margin: 0;">
                    *One-time fee only. No subscription. Generated and delivered in 24 hours.
                  </p>
                </td>
              </tr>

              <!-- Spacing -->
              <tr><td style="height: 25px;"></td></tr>

              <!-- Key Benefits -->
              <tr>
                <td>
                  <h3 style="font-size: 15px; font-weight: bold; color: #ffffff; margin: 0 0 15px 0; border-bottom: 1px solid #27272a; padding-bottom: 5px;">What you will get:</h3>
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #d4d4d8; line-height: 1.6;">
                    <tr>
                      <td style="padding: 4px 0;"><span style="color: #10b981; margin-right: 8px;">✔</span> Personalized macro breakdown based on your TDEE</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0;"><span style="color: #10b981; margin-right: 8px;">✔</span> Multi-budget options (Low cost / Premium choice recipes)</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0;"><span style="color: #10b981; margin-right: 8px;">✔</span> Pure Veg, Non-Veg, Egg, or Vegan customizable dishes</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0;"><span style="color: #10b981; margin-right: 8px;">✔</span> Free dedicated WhatsApp support from certified coaches</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Spacing -->
              <tr><td style="height: 30px;"></td></tr>

              <!-- Call to Action -->
              <tr>
                <td style="text-align: center;">
                  <a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard/ai-diet" style="background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-size: 14px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);">
                    Claim Your ₹99 Diet Offer
                  </a>
                </td>
              </tr>

              <!-- Spacing -->
              <tr><td style="height: 30px;"></td></tr>

              <!-- Footer -->
              <tr>
                <td style="border-top: 1px solid #27272a; padding-top: 20px; text-align: center;">
                  <p style="font-size: 10px; color: #52525b; margin: 0;">
                    You are receiving this because you registered with NutriBudget AI. 
                    If you do not want to receive offers, you can update your preference in settings.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

module.exports = { generateSummaryHtml, generateOfferHtml };
