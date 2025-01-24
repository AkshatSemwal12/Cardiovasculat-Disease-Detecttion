import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Import your custom CSS if needed

function App() {
  const [formData, setFormData] = useState({
    gender: 0,
    age: '',
    education: 0,
    currentSmoker: 0,
    cigsPerDay: 0,
    BPMeds: 0,
    prevalentStroke: 0,
    prevalentHyp: 0,
    diabetes: 0,
    totChol: 0,
    sysBP: 0,
    diaBP: 0,
    BMI: 0,
    heartRate: 0,
    glucose: 0,
  });

  const [result, setResult] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = ['gender', 'age', 'education', 'cigsPerDay', 'totChol', 'sysBP', 'diaBP', 'BMI', 'heartRate', 'glucose'].includes(name) 
      ? Number(value) 
      : value === '1' ? 1 : 0;

    setFormData((prevData) => ({ ...prevData, [name]: updatedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/cvd/detect', formData);
      setResult(response.data.riskScore);

      if (response.data.riskScore === 1) {
        const recResponse = await axios.post('http://localhost:5000/cvd/reccommend', { riskScore: response.data.riskScore });
        setRecommendations(recResponse.data.recommendations);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        setError('Failed to fetch risk score. Please try again.');
      } else {
        setError('An error occurred while submitting the form.');
      }
    }
  };

  return (
    <div className="App container mt-5">
      <h1 className="text-center">CVD Risk Detection</h1>
      <form onSubmit={handleSubmit} className="bg-light p-4 rounded shadow">
        <div className="form-group">
          <label>Gender (1 for male, 0 for female):</label>
          <input className="form-control" type="number" name="gender" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Age:</label>
          <input className="form-control" type="number" name="age" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Education (0-4):</label>
          <input className="form-control" type="number" name="education" onChange={handleChange} required />
        </div>
        {/* Additional form fields */}
        <div className="form-group">
          <label>Current Smoker (1 or 0):</label>
          <input className="form-control" type="text" name="currentSmoker" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Cigarettes Per Day:</label>
          <input className="form-control" type="number" name="cigsPerDay" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Blood Pressure Meds (1 or 0):</label>
          <input className="form-control" type="text" name="BPMeds" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Prevalent Stroke (1 or 0):</label>
          <input className="form-control" type="text" name="prevalentStroke" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Prevalent Hypertension (1 or 0):</label>
          <input className="form-control" type="text" name="prevalentHyp" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Diabetes (1 or 0):</label>
          <input className="form-control" type="text" name="diabetes" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Total Cholesterol:</label>
          <input className="form-control" type="number" name="totChol" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Systolic BP:</label>
          <input className="form-control" type="number" name="sysBP" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Diastolic BP:</label>
          <input className="form-control" type="number" name="diaBP" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>BMI:</label>
          <input className="form-control" type="number" name="BMI" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Heart Rate:</label>
          <input className="form-control" type="number" name="heartRate" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Glucose Level:</label>
          <input className="form-control" type="number" name="glucose" onChange={handleChange} required />
        </div>
        <button className="btn btn-primary btn-block" type="submit">Submit</button>
      </form>

      {result !== null && (
        <div className="mt-4">
          <h2>Risk Score: {result}</h2>
          {result === 1 && (
            <div>
              <p>The person has a high risk of facing cardiovascular disease.</p>
              <h3>Recommendations:</h3>
              <ul>
                {recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
          {result === 0 && <p>The person is at low risk for cardiovascular disease.</p>}
        </div>
      )}

      {error && <p className="text-danger">{error}</p>}
    </div>
  );
}

export default App;
