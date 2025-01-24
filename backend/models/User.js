const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  gender: { type: Number, required: true },              // 1 for male, 0 for female
  age: { type: Number, required: true },                 // Age
  education: { type: Number, required: true },           // Education (0-4)
  currentSmoker: { type: Boolean, required: true },      // Current Smoker (true for 1, false for 0)
  cigsPerDay: { type: Number, required: true },          // Cigarettes Per Day
  BPMeds: { type: Boolean, required: true },             // Blood Pressure Meds (true for 1, false for 0)
  prevalentStroke: { type: Boolean, required: true },    // Prevalent Stroke (true for 1, false for 0)
  prevalentHyp: { type: Boolean, required: true },       // Prevalent Hypertension (true for 1, false for 0)
  diabetes: { type: Boolean, required: true },           // Diabetes (true for 1, false for 0)
  totChol: { type: Number, required: true },             // Total Cholesterol
  sysBP: { type: Number, required: true },               // Systolic BP
  diaBP: { type: Number, required: true },               // Diastolic BP
  BMI: { type: Number, required: true },                 // BMI
  heartRate: { type: Number, required: true },           // Heart Rate
  glucose: { type: Number, required: true },             // Glucose Level
  riskScore: { type: Number }                            // Output from detection model
});

// Export the User model
module.exports = mongoose.model('User', userSchema);
