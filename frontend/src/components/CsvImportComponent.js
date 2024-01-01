import React, { useState, useEffect } from "react";
import { ProgressBar, Modal, Table } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import io from "socket.io-client";

var socket;

const CsvImportComponent = () => {
  const [file, setFile] = useState(null);
  const [validationCompleted, setValidationCompleted] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [showInvalidModal, setShowInvalidModal] = useState(false);
  const [invalidRecords, setInvalidRecords] = useState([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const ENDPOINT = "http://localhost:5000";

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup");
    socket.on("connected", () => console.log("Connected with server"));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Listen for validation progressPercentage updates from the server
    socket.on("validationProgress", (data) => {
      const {
        message,
        progress,
        invalidRecords: newInvalidRecords,
        completed,
      } = data;
      setValidationMessage(message);
      if (newInvalidRecords) {
        setInvalidRecords(newInvalidRecords);
      }

      if (completed) {
        setValidationCompleted(true);
        if (newInvalidRecords === null) {
          socket.emit("startProcessing");
        } else {
          setShowInvalidModal(true);
        }
      }

      setProgressPercentage(progress);
    });
  }, []);

  useEffect(() => {
    if (validationCompleted && !showInvalidModal) {
      startProcessing();
    }
  }, [validationCompleted]);

  const startProcessing = () => {
    socket.emit("startProcessing");
    socket.on("processProgress", (data) => {
      const { message, progress } = data;
      setValidationMessage(message);
      setProgressPercentage(progress);
    });
  };

  const handleValidation = async () => {
    const text = await file.text();
    const rows = text.split("\n");

    rows.shift();
    rows.unshift();
    socket.emit("startValidation", rows);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setValidationMessage("");
    setProgressPercentage(0);
    setInvalidRecords([]);
    setValidationCompleted(false);
  };

  const handleImport = () => {
    setShowInvalidModal(false);
    startProcessing();
  };

  return (
    <div className="d-flex justify-content-center align-items-center h-100 my-5">
      <div>
        <h2 className="text-center mb-3">CSV Import</h2>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <Button
          variant="primary"
          disabled={!file || validationCompleted}
          onClick={handleValidation}
        >
          Validate
        </Button>
        {progressPercentage > 0 && (
          <div className="mt-3">
            <ProgressBar
              animated
              variant={
                progressPercentage < 40
                  ? "info"
                  : progressPercentage < 70
                  ? "warning"
                  : "success"
              }
              now={progressPercentage}
              label={`${progressPercentage.toFixed(2)}%`}
            />
          </div>
        )}
        <p className="text-center mt-2">{validationMessage}</p>
        <Modal
          show={showInvalidModal && invalidRecords.length > 0}
          onHide={() => setShowInvalidModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Found Invalid Records</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {invalidRecords.length > 0 && (
              <div>
                <p>Following records are invalid :</p>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Email</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invalidRecords.map((record, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{record.email}</td>
                        <td>{record.firstName}</td>
                        <td>{record.lastName}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowInvalidModal(false)}
            >
              Close
            </Button>
            <Button variant="primary" onClick={handleImport}>
              Proceed with Valid Records
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default CsvImportComponent;
