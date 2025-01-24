const express = require('express');
const User = require('../models/User');
const { spawn } = require('child_process'); // Use spawn from child_process
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Data validation function
const validateData = (data) => {
    const requiredFields = [
        'gender', 'age', 'education', 'currentSmoker', 'cigsPerDay', 'BPMeds',
        'prevalentStroke', 'prevalentHyp', 'diabetes', 'totChol', 'sysBP',
        'diaBP', 'BMI', 'heartRate', 'glucose'
    ];

    for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null) {
            return false;
        }
    }
    return true;
};

// POST route to handle /detect
router.post('/detect', async (req, res) => {
    const userData = req.body;

    // Validate the incoming data
    if (!validateData(userData)) {
        console.error('Validation failed for user data:', userData);
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Prepare the input data as a comma-separated string
    const inputData = `${userData.gender},${userData.age},${userData.education},${userData.currentSmoker},${userData.cigsPerDay},${userData.BPMeds},${userData.prevalentStroke},${userData.prevalentHyp},${userData.diabetes},${userData.totChol},${userData.sysBP},${userData.diaBP},${userData.BMI},${userData.heartRate},${userData.glucose}`;
    
    console.log('Input data for model:', inputData);

    const scriptPath = path.join(__dirname, '../models/cvd_detect.py');
    console.log('Attempting to run Python script at:', scriptPath);

    // Check if the Python script exists before running it
    fs.access(scriptPath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`${scriptPath} does not exist`);
            return res.status(500).json({ error: 'Internal server error: Python script not found' });
        }

        // Run Python script with the arguments using spawn
        const pythonProcess = spawn('C:\\Users\\aksha\\.vscode\\CVD_PROJECT\\myenv\\Scripts\\python.exe', [scriptPath, ...inputData.split(',')]);

        // Capture output from Python script
        let pythonOutput = '';
        pythonProcess.stdout.on('data', (data) => {
            pythonOutput += data.toString();
        });

        // Capture errors from Python script
        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python script stderr: ${data}`);
        });

        // Handle when the Python script finishes execution
        pythonProcess.on('close', async (code) => {
            console.log(`Python script exited with code ${code}`);

            if (code !== 0) {
                return res.status(500).json({ error: 'Error executing Python script' });
            }

            // Parse the output from Python script
            const riskScore = parseFloat(pythonOutput.trim());
            if (isNaN(riskScore)) {
                console.error('Invalid risk score received:', pythonOutput);
                return res.status(500).json({ error: 'Invalid risk score received from model' });
            }

            // Optionally save the user and risk score to the database (optional)
            const newUser = new User({
                ...userData,
                riskScore,
            });

            try {
                await newUser.save();
                console.log('User saved successfully:', newUser);
                // Send the risk score back to the frontend
                return res.json({ success: true, riskScore });
            } catch (saveError) {
                console.error('Error saving user to database:', saveError);
                return res.status(500).json({ error: 'Error saving user to database' });
            }
        });
    });
});

router.post('/reccommend', async (req, res) => {
    const { riskScore } = req.body;

    if (riskScore === undefined) {
        return res.status(400).json({ error: 'Risk score is required' });
    }

    console.log('Received riskScore:', riskScore);

    // Logic to generate recommendations based on the riskScore
    let recommendations = [];
    
    if (riskScore === 1) {
        recommendations = [
            "Consult a cardiologist immediately.",
            "Adopt a heart-healthy diet (low in salt and saturated fats).",
            "Engage in regular physical activity.",
            "Monitor your blood pressure regularly.",
            "Consider lifestyle changes such as quitting smoking if you smoke.",
            "Follow prescribed medications and treatment plans closely.",
        ];
    } else {
        return res.status(200).json({ message: "The person has no immediate risk of cardiovascular disease.", riskScore });
    }

    // Send the recommendations back to the frontend
    return res.status(200).json({ recommendations });
});


module.exports = router;
