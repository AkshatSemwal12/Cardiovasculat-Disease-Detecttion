import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.model_selection import train_test_split
from skopt import BayesSearchCV
from skopt.space import Real, Categorical, Integer
import sys
import pickle
import os

def load_or_train_model():
    model_path = os.path.join(os.path.dirname(__file__), 'cvd_model.pkl')

    # Comment out unnecessary print statements
    # print(f"Checking for model at: {model_path}")

    if os.path.exists(model_path):
        with open(model_path, 'rb') as model_file:
            model = pickle.load(model_file)
            # print("Model loaded successfully from disk.")
        return model, None
    else:
        # print("Model not found. Training a new model...")
        data = pd.read_csv('dataset/framingham.csv')
        data = data.dropna()

        X = data.drop(columns=['TenYearCHD'])
        y = data['TenYearCHD']
        k_best = SelectKBest(score_func=f_classif, k='all')
        X_selected = k_best.fit_transform(X, y)

        X_train, X_test, y_train, y_test = train_test_split(X_selected, y, test_size=0.3, random_state=42)

        param_space = {
            'n_estimators': Integer(100, 500),
            'max_depth': Integer(5, 50),
            'min_samples_split': Integer(2, 10),
            'min_samples_leaf': Integer(1, 10),
            'class_weight': Categorical(['balanced', 'balanced_subsample']),
        }

        rf = RandomForestClassifier(random_state=42)
        bayes_search = BayesSearchCV(rf, param_space, n_iter=32, cv=5, scoring='accuracy', random_state=42)
        bayes_search.fit(X_train, y_train)

        best_rf = bayes_search.best_estimator_

        with open(model_path, 'wb') as model_file:
            pickle.dump(best_rf, model_file)

        return best_rf, k_best

def main():
    model, k_best = load_or_train_model()

    if len(sys.argv) != 16:
        # Comment out error message
        # print("Error: Expected 15 input values for prediction.")
        sys.exit(1)

    try:
        # Convert arguments to appropriate types
        male = int(sys.argv[1])
        age = float(sys.argv[2])
        education = float(sys.argv[3])
        currentSmoker = int(sys.argv[4])
        cigsPerDay = float(sys.argv[5])
        BPMeds = int(sys.argv[6])
        prevalentStroke = int(sys.argv[7])
        prevalentHyp = int(sys.argv[8])
        diabetes = int(sys.argv[9])
        totChol = float(sys.argv[10])
        sysBP = float(sys.argv[11])
        diaBP = float(sys.argv[12])
        BMI = float(sys.argv[13])
        heartRate = float(sys.argv[14])
        glucose = float(sys.argv[15])
    except ValueError as e:
        # Comment out error message
        # print(f"Error: Invalid input data format: {e}")
        sys.exit(1)

    input_df = pd.DataFrame({
        'male': [male],
        'age': [age],
        'education': [education],
        'currentSmoker': [currentSmoker],
        'cigsPerDay': [cigsPerDay],
        'BPMeds': [BPMeds],
        'prevalentStroke': [prevalentStroke],
        'prevalentHyp': [prevalentHyp],
        'diabetes': [diabetes],
        'totChol': [totChol],
        'sysBP': [sysBP],
        'diaBP': [diaBP],
        'BMI': [BMI],
        'heartRate': [heartRate],
        'glucose': [glucose]
    })

    # Comment out the debug print statement
    # print("Input DataFrame created:", input_df)

    if k_best:
        input_selected = k_best.transform(input_df)
    else:
        input_selected = input_df.values

    try:
        # Make prediction and print only the risk score
        risk_score = model.predict(input_selected)[0]
        print(risk_score)  # Only print the score, no extra text
        sys.stdout.flush()
    except Exception as e:
        # Comment out error message
        # print(f"Error during prediction: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
