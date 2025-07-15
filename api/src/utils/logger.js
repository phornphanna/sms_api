const fs = require("fs/promises");
const path = require("path");
const moment = require("moment");

/**
 * Logs error messages with timestamp to a daily log file.
 * @param {string} controller - Prefix/module name (used as filename prefix)
 * @param {string|Error} message - The error message or object
 */
const logError = async (controller, message) => {
  try {
    const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
    const logDir = path.join(__dirname, "logs");

    // Use controller name + date as filename
    const date = moment().format("YYYY-MM-DD");
    const filePath = path.join(logDir, `${controller}-${date}.log`);

    await fs.mkdir(logDir, { recursive: true });

    const logMessage = `[${timestamp}] ${message.stack || message}\n`;
    await fs.appendFile(filePath, logMessage);
  } catch (err) {
    console.error("Error writing to log file:", err);
  }
};

module.exports = logError;
