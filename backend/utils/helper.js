const fs = require("fs");
const writeToFile = (processedData) => {
  const outputFile = "processedData.json";

  fs.writeFile(outputFile, JSON.stringify(processedData, null, 2), (err) => {
    if (err) {
      console.error("Error writing to file:", err);
    } else {
      console.log(`Processed data written to ${outputFile}`);
    }
  });
};

module.exports = { writeToFile };
