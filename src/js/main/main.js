#!/usr/bin/env electron
// -*- mode: js -*-
// vim: set filetype=javascript :

'use strict';

global.shellStartTime = Date.now();

const electron = require('electron');

// Module to control application life.
const app = electron.app;

const path = require('path');
const fsExtra = require('fs-extra');
const settings = require('electron-settings');
const settingsPath = app.getPath('userData');

// ensure that the directory for the settings actually exists
// otherwise, electron-settings may fail if used before the 'ready' event
fsExtra.ensureDirSync(settingsPath);

// write defautl settings to Settings only file if it is empty
const defaultSettings = require(path.join(__dirname,"../../json/defaults.json"));
if(Object.keys(settings.getAll()).length==0)
    settings.setAll(defaultSettings,{ prettify: true });

// like get() function, but with automatic fallback to defaults
settings.getWithDefault = function(keyPath) {
    if(this.has(keyPath)) {
        // return value from the Settings
        return this.get(keyPath);
    } else {
        // return value from the defaults
        var obj = defaultSettings;
        const keys = keyPath.split(/\./);

        for(let i = 0, len = keys.length; i < len; i++) {
            const key = keys[i];

            if(Object.prototype.hasOwnProperty.call(obj, key)) {
                obj = obj[key];
            } else {
                return undefined;
            }
        }

        return obj;
    }
}

function getLinuxIcon() {
    if(process.mainModule.filename.indexOf('app.asar') === -1)
        return path.resolve(__dirname, 'build', '48x48.png');
    else
        return path.resolve(__dirname, '..', '48x48.png');
}

const yargs = require('yargs'); // https://www.npmjs.com/package/yargs

//   if(args.dev){ mainWindow.openDevTools(); } // --remote-debugging-port=8315 .port

// TODO: mouse cursor? language?
const options = yargs.wrap(yargs.terminalWidth())
.alias('h', 'help').boolean('h').describe('h', 'Print this usage message.')
.alias('V', 'version').boolean('V').describe('V', 'Print the version. Combine with -v to get more details.')
.alias('v', 'verbose').count('v').describe('v', 'Increase Verbosity').default('v', settings.getWithDefault("verbose"))
.alias('d', 'dev').boolean('d').describe('d', 'Run in development mode.').default('d', settings.getWithDefault("devTools"))
.alias('p', 'port').number('p').describe('p', 'Specify remote debugging port.').coerce('p', p => {
    if(p === undefined) {
        return settings.getWithDefault("remoteDebuggingPort");
    } else {
        const pInt = Number.parseInt(p);
        if( /[0-9]+/.test(p) && pInt >= 0 && pInt <= 65535) {
            return pInt;
        } else {
            throw new Error(`Invalid remote debugging port: ${p}`);
        }
    }
} )
.alias('c', 'cursor').boolean('c').describe('c', 'Toggle Mouse Cursor (TODO)').default('m', settings.getWithDefault("cursor"))
.alias('m', 'menu').boolean('m').describe('m', 'Toggle Main Menu').default('m', settings.getWithDefault("menu"))
.alias('k', 'kiosk').boolean('k').describe('k', 'Toggle Kiosk Mode').default('k', settings.getWithDefault("kiosk"))
.alias('T', 'always-on-top').boolean('T').describe('T', 'Toggle Always On Top').default('T', settings.getWithDefault("alwaysOnTop"))
.alias('f', 'fullscreen').boolean('f').describe('f', 'Toggle Fullscreen Mode').default('f', settings.getWithDefault("fullscreen"))
.alias('i', 'integration').boolean('i').describe('i', 'node Integration').default('i', settings.getWithDefault("integration"))
.boolean('localhost').describe('localhost', 'Restrict to LocalHost').default('localhost', settings.getWithDefault("localhost"))
.alias('z', 'zoom').number('z').describe('z', 'Set Zoom Factor').default('z', settings.getWithDefault("zoom"))
.alias('l', 'url').string('l').requiresArg('l').describe('l', 'URL to load')
.alias('s','serve').string('s').nargs('s',1).describe('s','Open url relative to this path served via built-in HTTP server').coerce('s',path => {
    const nsdError = new Error(`No such directory: ${path}`);
    try {
        if (fsExtra.lstatSync(path).isDirectory())
            return path;
        else
            throw nsdError;
    } catch (err) {
        // handle lstat error
        if (err.code == 'ENOENT') {
            //no such file or directory
            throw nsdError;
        } else {
            throw err;
        }
    }
})
.alias('t', 'transparent').boolean('t').describe('t', 'Transparent Browser Window').default('t', settings.getWithDefault("transparent"))
.number('retry').describe('retry', 'Retry after given number of seconds if loading the page failed (0 to disable)').default('retry',settings.getWithDefault('retryTimeout'))
.string('preload').describe('preload', 'preload a JavaScript file')
.string('append-chrome-switch').coerce('append-chrome-switch',function(xs){
    function processSwitch(s) {
        if(s.length==0)
            throw new Error("Empty Chrome CLI switch");
        
        if(!s.startsWith('--'))
            throw new Error("Chrome CLI switch must start with '--'");
            
        var parts = s.substr(2).split("=",2);
        return parts.length == 1 ? { key: parts[0] } : { key: parts[0], value: parts[1] };
    };
    xs = typeof xs == 'string' ? [xs] : xs;
    return xs.map(processSwitch);
}).describe('append-chrome-switch', 'Append switch to internal Chrome browser switches').default('append-chrome-switch',[])
.string('append-chrome-argument').coerce('append-chrome-argument', xs=>typeof xs == 'string' ? [xs] : xs ).describe('append-chrome-argument', 'Append positional argument to internal Chrome browser argument').default('append-chrome-argument',[])
.boolean('use-minimal-chrome-cli').describe('use-minimal-chrome-cli', 'Don\'t append anything to the internal Chrome command line by default')
.usage('Kiosk Web Browser\n    Usage: $0 [options] [url]' )
.fail((msg,err,yargs) => {
    yargs.showHelp();
    console.error(msg);
    throw( err ? err : new Error("CLI option parsing failed") );
})
.help(false) // automatic exit after help doesn't work after app.onReady
.version(false) // automatic exit after version doesn't work after app.onReady
.strict();
/*.fail(function (msg, err, yargs) { f (err) throw err // preserve stack
    console.error('You broke it!'); console.error(msg); console.error('You should be doing', yargs.help()); process.exit(1); })*/

// settings.getWithDefault("default_html")

var args;
try {

    // running electron via npm/yarn adds an extra '.' cli argument after the exe path
    // and we need to strip that away.
    args = options.parse(process.argv.slice(app.isPackaged ? 1 : 2 ));
} catch(err) {
    app.exit(1);
    return;
}

var VERBOSE_LEVEL = args.verbose;

function WARN()  { VERBOSE_LEVEL >= 0 && console.log.apply(console, arguments); }
function INFO()  { VERBOSE_LEVEL >= 1 && console.log.apply(console, arguments); }
function DEBUG() { VERBOSE_LEVEL >= 2 && console.log.apply(console, arguments); }
function TRACE(a) { VERBOSE_LEVEL >= 2 && console.trace(a); }
DEBUG(process.argv); // [1..]; // ????

DEBUG('Help: ' + (args.help) );
DEBUG('Version: ' + (args.version) );
DEBUG('Verbose: ' + (args.verbose) );
DEBUG('Dirname: ' + (__dirname) );
DEBUG('Dev: ' + (args.dev) );
DEBUG('RemoteDebuggingPort: ' + (args.port) );
DEBUG('Cursor: ' + (args.cursor) );

DEBUG('Menu: ' + (args.menu) );
DEBUG('Fullscreen Mode: ' + (args.fullscreen));
DEBUG('Testing?: ' + (args.testapp));
DEBUG('Kiosk Mode: ' + (args.kiosk));
DEBUG('Always On Top: ' + (args["always-on-top"]));
DEBUG('Zoom Factor: ' + (args.zoom));
DEBUG('Node Integration: ' + (args.integration));
DEBUG('Serve files: ' + (args.serve));
DEBUG('--url: ' + (args.url) );
DEBUG('Retry: ' + (args.retry));
DEBUG('Preload: ' + (args.preload));
DEBUG('Minimal Chrome CLI: ' + (args["use-minimal-chrome-cli"]));
DEBUG('Chrome options to append: ' + JSON.stringify(args["append-chrome-switch"]));
DEBUG('Chrome arguments to append: ' + JSON.stringify(args["append-chrome-argument"]));

DEBUG('Further Args: [' + (args._) + '], #: [' + args._.length + ']');

if(args.help){ options.showHelp(); app.quit(); return; };

if(args.version){
    if( VERBOSE_LEVEL == 0 ) {
        console.log(`v${app.getVersion()}`);
    } else {
        console.log(`Kiosk browser: v${app.getVersion()}`);
        console.log(`Electron: v${process.versions.electron}`);
        console.log(`Node: v${process.versions.node}`);
        console.log(`Chromium: v${process.versions.chrome}`);
    }
    app.quit();
    return;
};

let server;
const htmlPath = args.serve ? typeof settings.getWithDefault("serve") === "undefined" : args.serve;
const urlPrefixPromise = typeof htmlPath === "undefined" ? Promise.resolve("") : require('portfinder').getPortPromise()
    .then(port => {
        // `port` is guaranteed to be a free port in this scope.
        // -> start HTTP server on that port
        const finalhandler = require('finalhandler');
        const http = require('http');
        const serveStatic = require('serve-static');

        // Serve up folder provided via CLI option
        const serve = serveStatic(path.resolve(args.serve), {'index': ['index.html', 'index.htm']});

        // Create server
        server = http.createServer(function onRequest(req, res) {
            serve(req, res, finalhandler(req, res))
        });

        // Do something about errors
        server.on('error', err => { throw err; } );

        const host = 'localhost';
        const urlPrefix = `http://${host}:${port}/`;

        // Listen
        server.listen(port,host);

        DEBUG( `Serving ${args.serve} at ${urlPrefix}`);

        return urlPrefix;
    });

if (args.port)
    args['append-chrome-switch'].push({key: 'remote-debugging-port', value: args.port});

if (args.localhost)
    args['append-chrome-switch'].push({key: 'host-rules', value: 'MAP * 127.0.0.1'});

const applyChromiumCmdLine = require(path.join(__dirname,'applyChromiumCmdLine.js'));
applyChromiumCmdLine(args['use-minimal-chrome-cli'],args['append-chrome-switch'],args['append-chrome-argument']);

// var crashReporter = require('crash-reporter');
// crashReporter.start(); // Report crashes to our server: productName: 'Kiosk', companyName: 'IMAGINARY'???

function logAndExit(title,error) {
    WARN(title);
    WARN(error);

    // unhandled exceptions should be considered fatal
    app.exit(-1);
}

['uncaughtException','unhandledRejection'].forEach(e => process.on(e,error=>logAndExit(e,error)));

// delay all execution until server has been started
urlPrefixPromise.then( urlPrefix => {

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function()
{
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

var {Menu} = electron; //require('menu'); // var MenuItem = require('menu-item');

if(!args.menu) 
{
  menu = Menu.buildFromTemplate([]);
  Menu.setApplicationMenu(menu);
} else 
{
 var template = 
 [
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      },
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Ctrl+Command+F';
          else
            return 'F11';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Alt+Command+I';
          else
            return 'Ctrl+Shift+I';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.toggleDevTools();
        }
      },
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'GoBack',
        click: function(item, focusedWindow) {
//      console.log(focusedWindow);
          if (focusedWindow) { // .webContents.canGoBack()
            focusedWindow.webContents.goBack();
          }
        }
      },
//      {
//        label: 'Index',
//        click: function(item, focusedWindow) {
////      console.log(focusedWindow);
//          if (focusedWindow) {
//            focusedWindow.loadURL(`kiosk://home`);
//          }
//        }
//      },
//      {
//        label: 'Learn More',
//        click: function(item, focusedWindow) {
//          if (focusedWindow) {
//           focusedWindow.loadURL(`https://github.com/hilbert/hilbert-docker-images/`);
//        // require('shell').openExternal('https://github.com/hilbert/hilbert-docker-images/tree/devel/images/kiosk') ;
//           }
//        }
//      },
    ]
  },
  {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
  },
  {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        role: 'quit'
  },
 ];
  var menu = Menu.getApplicationMenu();

  if( menu ) {
    Menu.buildFromTemplate(template).items.forEach((val, index) => {
      // console.log(`${index}: ${val}`);
      menu.append(val);
    });
  } else { menu = Menu.buildFromTemplate(template); }

  Menu.setApplicationMenu(menu);
};

process.on('SIGUSR1', () => mainWindow.webContents.toggleDevTools() );

function _min(a, b){ if(a <= b) return (a); else return (b); }
function _max(a, b){ if(a >= b) return (a); else return (b); }

{
    const webprefs = {
       javascript: true,
       images: true,
       webaudio: true,
       plugins: true,
       webgl: true,
       java: true,
       webSecurity: false, 'web-security': false,
       experimentalFeatures: true, 'experimental-features': true, 
       overlayFullscreenVideo: true, 'overlay-fullscreen-video': true, 
       experimentalCanvasFeatures: true, 'experimental-canvas-features': true, 
       allowRunningInsecureContent: true, 'allow-running-insecure-content': true,
       zoomFactor: args.zoom, 'zoom-factor': args.zoom,
       nodeIntegration: args.integration, 'node-integration': args.integration
    };
    
    if(args.preload)
        webprefs.preload = path.resolve(args.preload);

   const {screen} = electron; // require('screen');
   const size = screen.getPrimaryDisplay().bounds;

   // NOTE: span all enabled displays:
   var _x = size.x; var _y = size.y; var _r = _x + size.width; var _b = _y + size.height;
   const displays = screen.getAllDisplays(); var _d;
   for(var d in displays)
   {  _d = displays[d].bounds;

     _x = _min(_x, _d.x);
     _y = _min(_y, _d.y);
     _r = _max(_r, _d.x + _d.width);
     _b = _max(_b, _d.y + _d.height);
   };
   DEBUG('MAX SCREEN: (' + _x + ' , ' + _y + ') - (' + _r + ' , ' + _b + ')!');

    const options = { show: false
    , x: _x, y: _y, width: _r - _x, height: _b - _y
    , frame: !args.transparent
    , titleBarStyle: 'hidden-inset'
    , fullscreenable: true
    , fullscreen: args.fullscreen
    , icon: getLinuxIcon()
    , kiosk: args.kiosk
    , resizable: !args.transparent
    , transparent: args.transparent
    , alwaysOnTop: args["always-on-top"], 'always-on-top': args["always-on-top"]
    , webPreferences: webprefs, 'web-preferences': webprefs
    , acceptFirstMouse: true, 'accept-first-mouse': true
    };
// ,  resizable: ((!args.kiosk) && (!args.fullscreen))



//       textAreasAreResizable: true,
//    type: 'desktop',    'standard-window': true,
//    fullscreen: true,    frame: false,    kiosk: true,     resizable: false,    'always-on-top': true,    'auto-hide-menu-bar': true,    'title-bar-style': 'hidden' 
 

   mainWindow = new BrowserWindow(options);

   if((!args.menu) || args.kiosk) { mainWindow.setMenu(null); }

   if(args.fullscreen) {
       mainWindow.setMinimumSize(_r - _x,_b - _y);
       mainWindow.setContentSize(_r - _x,_b - _y);
   }

   mainWindow.webContents.on('new-window', function(event, _url) { event.preventDefault(); });

   mainWindow.on('app-command', function(e, cmd) {
      // Navigate the window back when the user hits their mouse back button
      if (cmd === 'browser-backward' && mainWindow.webContents.canGoBack() && (!args.kiosk)) { mainWindow.webContents.goBack(); }
   });

   // In the main process.
   mainWindow.webContents.session.on('will-download', function(event, item, webContents) {
     INFO("Trying to Download: ");
     INFO(item.getFilename());
     INFO(item.getMimeType());
     INFO(item.getTotalBytes());
     item.cancel(); // Nope... this is a kiosk!
   });

   mainWindow.once('ready-to-show', () => {
     if(args.fullscreen){ mainWindow.maximize(); };
     mainWindow.show();
     mainWindow.focus();
   });

   mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.setZoomFactor(args.zoom);
    mainWindow.setFullScreen(args.fullscreen);
   });

    // retry loading the page if it failed
    mainWindow.webContents.on('did-fail-load', ( event, errorCode, errorDescription, validatedURL, isMainFrame ) => {
        if( errorCode == -3 || errorCode == 0 )
            return;

        WARN(`Loading ${validatedURL} failed with Error ${errorCode}: ${errorDescription}`);
        var errorMsgDiv  = `
            <div style="position:absolute;top:0px;left:0px;width: 100%;color: white;background-color: black;">
                Error ${errorCode}: ${errorDescription}<br />
                URL: ${validatedURL}<br />
        `;

        if(args.retry>0)
            errorMsgDiv += `Reloading in ${args.retry}s`;
            
        errorMsgDiv += `</div>`;

        mainWindow.webContents.once('dom-ready',()=>{
            mainWindow.webContents.executeJavaScript(`document.body.innerHTML += ${JSON.stringify(errorMsgDiv)};`);
            if(args.retry>0) {
                mainWindow.webContents.executeJavaScript(`setTimeout(()=>window.location.reload(),${args.retry*1000});`);
            }
        });
    });

   mainWindow.setFullScreen(args.fullscreen);

   // Open the DevTools?
   if(args.dev){ mainWindow.openDevTools(); } // --remote-debugging-port=8315

   // and load some URL?!
   const partialUrl = (args._.length > 0)? args._[0] : (args.url ? args.url : (args.serve ? 'index.html' : settings.getWithDefault('home')));
   const parseUrl = require('url').parse;
   const parsedPartialUrl = parseUrl(partialUrl);
   DEBUG(parsedPartialUrl);
   if(parsedPartialUrl.protocol === "kiosk:" ) {
       switch(parsedPartialUrl.hostname) {
           case 'home':
               mainWindow.loadURL('file://'+path.normalize(`${__dirname}/../../html/index.html`));
               break;
           case 'testapp':
               mainWindow.loadURL('file://'+path.normalize(`${__dirname}/../../html/testapp.html`));
               break;
           default:
               console.error(`Unknown kiosk:// url: ${partialUrl}`);
               app.exit(-1);
       }
   } else {
       const fullUrl = parsedPartialUrl.protocol === null ? ( args.serve ? urlPrefix + partialUrl : `file://${path.resolve(partialUrl)}`) : partialUrl;
       DEBUG(`urlPrefix: ${urlPrefix}`);
       DEBUG(`partialUrl: ${partialUrl}`);
       DEBUG( `Loading ${fullUrl}`);
       mainWindow.loadURL(fullUrl);
   }



//  mainWindow.webContents.setZoomFactor(args.zoom);

//  mainWindow.webContents.executeJavaScript(`
//    module.paths.push(path.resolve('/opt/node_modules'));
//    module.paths.push(path.resolve('node_modules'));
//    module.paths.push(path.resolve('../node_modules'));
//    module.paths.push(path.resolve(__dirname, '..', '..', 'electron', 'node_modules'));
//    module.paths.push(path.resolve(__dirname, '..', '..', 'electron.asar', 'node_modules'));
//    module.paths.push(path.resolve(__dirname, '..', '..', 'app', 'node_modules'));
//    module.paths.push(path.resolve(__dirname, '..', '..', 'app.asar', 'node_modules'));
//    path = undefined;
//  `);



}

});

// Quit when all windows are closed.
app.on('window-all-closed', () => app.quit());

});