const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { validateEmail, validateName } = require("./utils/validation");
const { writeToFile } = require("./utils/helper");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

const PORT = 5000;

io.on("connection", (socket) => {
  const validRecords = [];

  const validateData = async (data) => {
    if (data == null || data?.length === 0) {
      socket.emit("error", "Data not recieved");
      return;
    }
    const totalRecords = data.length;
    const invalidRecords = [];
    let count = 0;
    for (const item of data) {
      const record = item.split(",");

      await new Promise((resolve) => setTimeout(resolve, 100)).then(() => {
        const isValidEmail = validateEmail(record[0]);
        const isValidLastName = record[1]?.trim() !== "";
        const isValidFirstName = record[2]?.trim() !== "";

        if (isValidEmail && isValidLastName && isValidFirstName) {
          validRecords.push({
            email: record[0],
            lastName: record[1],
            firstName: record[2],
          });
        } else {
          if (item) {
            console.log(count, item);

            invalidRecords.push({
              email: record[0],
              lastName: record[1],
              firstName: record[2],
            });
          }
        }

        // Emit progress message and details to the client
        const progress = Math.floor((validRecords.length / totalRecords) * 100);
        const message = `Validating email for ${record[0]}`;
        socket.emit("validationProgress", {
          message,
          progress,
          completed: false,
          invalidRecords: invalidRecords.length > 0 ? invalidRecords : null,
        });

        count++;

        if (count === data.length) {
          // Validation completed
          socket.emit("validationProgress", {
            message: `Validation completed ${
              data.length - invalidRecords.length
            }/${data.length} records valid`,
            progress: 100,
            completed: true,
            invalidRecords: invalidRecords.length > 0 ? invalidRecords : null,
          });
        }
      });
    }
  };

  const processRecords = async () => {
    let count = 0;
    const processedData = [];
    for (const item of validRecords) {
      const { email, lastName, firstName } = item;

      await new Promise((resolve) => setTimeout(resolve, 100)).then(() => {
        count++;

        const fullName = `${firstName} ${lastName}`;
        processedData.push({
          fullName,
          email: email,
        });
        const progress = Math.floor(
          (processedData.length / validRecords.length) * 100
        );
        const message = `Processing record ${count}`;
        socket.emit("processProgress", {
          message,
          progress,
          completed: false,
        });
      });
      if (count === validRecords.length) {
        // processing completed
        socket.emit("processProgress", {
          message: `Processing completed for ${processedData.length} records`,
          progress: 100,
          completed: true,
        });
        writeToFile(processedData);
      }
    }
  };

  socket.on("startValidation", (data) => {
    validateData(data);
  });

  socket.on("startProcessing", () => {
    console.log("Start Processing");
    processRecords();
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
