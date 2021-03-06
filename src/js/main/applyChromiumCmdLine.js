'use strict';

const {app} = require('electron');
const fs = require('fs');
const path = require('path');

module.exports = function (ignoreDefaults, additionalChromiumSwitches, additionalChromiumArguments) {
    // load default command line switches and arguments
    const appCmdLine = JSON.parse(fs.readFileSync(path.join(__dirname, "../../json/defaultAppCommandLine.json"), 'utf8'));

    // process switches
    const chromiumSwitches = ignoreDefaults ? additionalChromiumSwitches : appCmdLine.switches.concat(additionalChromiumSwitches);
    chromiumSwitches.forEach(s => s.hasOwnProperty("value") ? app.commandLine.appendSwitch(s.key, s.value) : app.commandLine.appendSwitch(s.key));

    // process arguments
    const chromiumArguments = ignoreDefaults ? additionalChromiumArguments : appCmdLine.arguments.concat(additionalChromiumArguments);
    chromiumArguments.forEach(a => app.commandLine.appendArgument(a));
};
