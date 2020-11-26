const path = require('path');

module.exports = [
    path.join(__dirname, '../renderer/addAppVersion.js'),
    path.join(__dirname, '../renderer/gamepadInputDetector.js'),
    path.join(__dirname, '../renderer/midiInputDetector.js'),
];
