// map the keys used in the settings onto the keys used on the command line
const settingsCmdLineMap = {
    'verbose': 'verbose',
    'devTools': 'dev',
    'remoteDebuggingPort': 'port',
    'menu': 'menu',
    'kiosk': 'kiosk',
    'alwaysOnTop': 'always-on-top',
    'fullscreen': 'fullscreen',
    'integration': 'integration',
    'localhost': 'localhost',
    'zoom': 'zoom',
    'transparent': 'transparent',
    'retryTimeout': 'retry',
};

function convert(settings) {
    return Object.assign(...Object.entries(settings)
        .map(([k, v]) => ({[settingsCmdLineMap.hasOwnProperty(k) ? settingsCmdLineMap[k] : k]: v}))
    );
}

module.exports = convert;