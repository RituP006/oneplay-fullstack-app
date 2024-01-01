# Oneplay Assignment

This is a Fullstack application built with ReactJS for the frontend, Node.js for the backend, and Socket.io for real-time communication. The app allows users to import a CSV file, validate the data, and process it in parallel on the backend. Socket.io is used to provide live progress updates during validation and processing.

### Features
- CSV Import: Users can upload a CSV file using the provided interface.
- Data Validation: Clicking the "Validate" button triggers data validation on the backend with live progress updates.
- Parallel Processing: Valid data is processed in parallel on the backend for faster execution.
- Handling Invalid Data: If there are missing fields for mandatory data, the invalid data is dropped. Users are then presented with the option to proceed with the processing of the remaining valid data.
- Handling processed data: The processed data will be written to a new file.

### Steps to Run

##### Backend

1. Navigate to the `backend` directory.

   ```bash
   cd backend
   
2. Install dependencies.
   
  ```bash
  npm install
  ```

3.Run the backend server.
    
    ```bash
    node server.js

- The backend server will run on http://localhost:5000.

##### Frontend

1. Navigate to the frontend directory.
   
    ```bash
    cd frontend
  
3. Install dependencies.
   
    ```bash
    npm install

4. Run the React app.
   
    ```bash
    npm start

- The app will run on http://localhost:3000.

