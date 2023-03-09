/**
 * @module barcode-js
 */
const barcodexpress = require("./barcodexpress.js");
const licensing = require("./licensing.js");
const types = require("./barcodetypes.js");

module.exports.analyze = barcodexpress.analyze;
module.exports.BarcodeType = types.BarcodeType;
module.exports.ModeTransitionType = types.ModeTransitionType;
module.exports.setSolutionName = licensing.setSolutionName;
module.exports.setSolutionKey = licensing.setSolutionKey;
module.exports.setOemLicenseKey = licensing.setOemLicenseKey;
