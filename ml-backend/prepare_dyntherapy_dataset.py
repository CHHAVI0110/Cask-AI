import os
import requests
import pandas as pd
import numpy as np

def download_dataset(url, output_path):
    """Download the dynTherapy dataset from the given URL."""
    response = requests.get(url)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'wb') as file:
        file.write(response.content)

def preprocess_dataset(file_path):
    """Preprocess the DynTherapy dataset for LSTM training."""
    # Load the dataset
    data = pd.read_csv(file_path)

    # Preprocessing steps (customize as necessary)
    # Assuming 'input' and 'target' columns for the sake of example
    inputs = data[['input1', 'input2']].values  # Example inputs
    targets = data['target'].values  # Example target

    # Normalize input data
    inputs_min = inputs.min(axis=0)
    inputs_max = inputs.max(axis=0)
    inputs_normalized = (inputs - inputs_min) / (inputs_max - inputs_min)

    # Reshape for LSTM 
    # Assuming a sequence length of 10 for this example
    X, y = [], []
    sequence_length = 10
    for i in range(len(inputs_normalized) - sequence_length):
        X.append(inputs_normalized[i:i + sequence_length])
        y.append(targets[i + sequence_length])
    
    X = np.array(X)
    y = np.array(y)
    
    return X, y

def save_preprocessed_data(X, y, X_output_path, y_output_path):
    """Save the preprocessed input and target data."""
    np.save(X_output_path, X)
    np.save(y_output_path, y)

def main():
    dataset_url = 'http://example.com/dyntherapy.csv'  # Replace with actual URL
    dataset_path = 'ml-backend/dyntherapy.csv'
    
    download_dataset(dataset_url, dataset_path)
    
    X, y = preprocess_dataset(dataset_path)
    
    save_preprocessed_data(X, y, 'ml-backend/X.npy', 'ml-backend/y.npy')

if __name__ == "__main__":
    main()