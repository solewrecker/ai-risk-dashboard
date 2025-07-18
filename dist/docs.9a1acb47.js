// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (
  modules,
  entry,
  mainEntry,
  parcelRequireName,
  externals,
  distDir,
  publicUrl,
  devServer
) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var importMap = previousRequire.i || {};
  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        if (externals[name]) {
          return externals[name];
        }
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        globalObject
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.require = nodeRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.distDir = distDir;
  newRequire.publicUrl = publicUrl;
  newRequire.devServer = devServer;
  newRequire.i = importMap;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  // Only insert newRequire.load when it is actually used.
  // The code in this file is linted against ES5, so dynamic import is not allowed.
  // INSERT_LOAD_HERE

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });
    }
  }
})({"6IEMQ":[function(require,module,exports,__globalThis) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SERVER_PORT = 1234;
var HMR_SECURE = false;
var HMR_ENV_HASH = "439701173a9199ea";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "f02641969a1acb47";
"use strict";
/* global HMR_HOST, HMR_PORT, HMR_SERVER_PORT, HMR_ENV_HASH, HMR_SECURE, HMR_USE_SSE, chrome, browser, __parcel__import__, __parcel__importScripts__, ServiceWorkerGlobalScope */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: {|[string]: mixed|};
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
interface ExtensionContext {
  runtime: {|
    reload(): void,
    getURL(url: string): string;
    getManifest(): {manifest_version: number, ...};
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_SERVER_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
declare var HMR_USE_SSE: boolean;
declare var chrome: ExtensionContext;
declare var browser: ExtensionContext;
declare var __parcel__import__: (string) => Promise<void>;
declare var __parcel__importScripts__: (string) => Promise<void>;
declare var globalThis: typeof self;
declare var ServiceWorkerGlobalScope: Object;
*/ var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData[moduleName],
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(fn) {
            this._acceptCallbacks.push(fn || function() {});
        },
        dispose: function(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData[moduleName] = undefined;
}
module.bundle.Module = Module;
module.bundle.hotData = {};
var checkedAssets /*: {|[string]: boolean|} */ , disposedAssets /*: {|[string]: boolean|} */ , assetsToDispose /*: Array<[ParcelRequire, string]> */ , assetsToAccept /*: Array<[ParcelRequire, string]> */ , bundleNotFound = false;
function getHostname() {
    return HMR_HOST || (typeof location !== 'undefined' && location.protocol.indexOf('http') === 0 ? location.hostname : 'localhost');
}
function getPort() {
    return HMR_PORT || (typeof location !== 'undefined' ? location.port : HMR_SERVER_PORT);
}
// eslint-disable-next-line no-redeclare
let WebSocket = globalThis.WebSocket;
if (!WebSocket && typeof module.bundle.root === 'function') try {
    // eslint-disable-next-line no-global-assign
    WebSocket = module.bundle.root('ws');
} catch  {
// ignore.
}
var hostname = getHostname();
var port = getPort();
var protocol = HMR_SECURE || typeof location !== 'undefined' && location.protocol === 'https:' && ![
    'localhost',
    '127.0.0.1',
    '0.0.0.0'
].includes(hostname) ? 'wss' : 'ws';
// eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if (!parent || !parent.isParcelRequire) {
    // Web extension context
    var extCtx = typeof browser === 'undefined' ? typeof chrome === 'undefined' ? null : chrome : browser;
    // Safari doesn't support sourceURL in error stacks.
    // eval may also be disabled via CSP, so do a quick check.
    var supportsSourceURL = false;
    try {
        (0, eval)('throw new Error("test"); //# sourceURL=test.js');
    } catch (err) {
        supportsSourceURL = err.stack.includes('test.js');
    }
    var ws;
    if (HMR_USE_SSE) ws = new EventSource('/__parcel_hmr');
    else try {
        // If we're running in the dev server's node runner, listen for messages on the parent port.
        let { workerData, parentPort } = module.bundle.root('node:worker_threads') /*: any*/ ;
        if (workerData !== null && workerData !== void 0 && workerData.__parcel) {
            parentPort.on('message', async (message)=>{
                try {
                    await handleMessage(message);
                    parentPort.postMessage('updated');
                } catch  {
                    parentPort.postMessage('restart');
                }
            });
            // After the bundle has finished running, notify the dev server that the HMR update is complete.
            queueMicrotask(()=>parentPort.postMessage('ready'));
        }
    } catch  {
        if (typeof WebSocket !== 'undefined') try {
            ws = new WebSocket(protocol + '://' + hostname + (port ? ':' + port : '') + '/');
        } catch (err) {
            // Ignore cloudflare workers error.
            if (err.message && !err.message.includes('Disallowed operation called within global scope')) console.error(err.message);
        }
    }
    if (ws) {
        // $FlowFixMe
        ws.onmessage = async function(event /*: {data: string, ...} */ ) {
            var data /*: HMRMessage */  = JSON.parse(event.data);
            await handleMessage(data);
        };
        if (ws instanceof WebSocket) {
            ws.onerror = function(e) {
                if (e.message) console.error(e.message);
            };
            ws.onclose = function() {
                console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
            };
        }
    }
}
async function handleMessage(data /*: HMRMessage */ ) {
    checkedAssets = {} /*: {|[string]: boolean|} */ ;
    disposedAssets = {} /*: {|[string]: boolean|} */ ;
    assetsToAccept = [];
    assetsToDispose = [];
    bundleNotFound = false;
    if (data.type === 'reload') fullReload();
    else if (data.type === 'update') {
        // Remove error overlay if there is one
        if (typeof document !== 'undefined') removeErrorOverlay();
        let assets = data.assets;
        // Handle HMR Update
        let handled = assets.every((asset)=>{
            return asset.type === 'css' || asset.type === 'js' && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
        });
        // Dispatch a custom event in case a bundle was not found. This might mean
        // an asset on the server changed and we should reload the page. This event
        // gives the client an opportunity to refresh without losing state
        // (e.g. via React Server Components). If e.preventDefault() is not called,
        // we will trigger a full page reload.
        if (handled && bundleNotFound && assets.some((a)=>a.envHash !== HMR_ENV_HASH) && typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') handled = !window.dispatchEvent(new CustomEvent('parcelhmrreload', {
            cancelable: true
        }));
        if (handled) {
            console.clear();
            // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
            if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') window.dispatchEvent(new CustomEvent('parcelhmraccept'));
            await hmrApplyUpdates(assets);
            hmrDisposeQueue();
            // Run accept callbacks. This will also re-execute other disposed assets in topological order.
            let processedAssets = {};
            for(let i = 0; i < assetsToAccept.length; i++){
                let id = assetsToAccept[i][1];
                if (!processedAssets[id]) {
                    hmrAccept(assetsToAccept[i][0], id);
                    processedAssets[id] = true;
                }
            }
        } else fullReload();
    }
    if (data.type === 'error') {
        // Log parcel errors to console
        for (let ansiDiagnostic of data.diagnostics.ansi){
            let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
            console.error("\uD83D\uDEA8 [parcel]: " + ansiDiagnostic.message + '\n' + stack + '\n\n' + ansiDiagnostic.hints.join('\n'));
        }
        if (typeof document !== 'undefined') {
            // Render the fancy html overlay
            removeErrorOverlay();
            var overlay = createErrorOverlay(data.diagnostics.html);
            // $FlowFixMe
            document.body.appendChild(overlay);
        }
    }
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log("[parcel] \u2728 Error resolved");
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    for (let diagnostic of diagnostics){
        let stack = diagnostic.frames.length ? diagnostic.frames.reduce((p, frame)=>{
            return `${p}
<a href="${protocol === 'wss' ? 'https' : 'http'}://${hostname}:${port}/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
        }, '') : diagnostic.stack;
        errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          \u{1F6A8} ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint)=>"<div>\uD83D\uDCA1 " + hint + '</div>').join('')}
        </div>
        ${diagnostic.documentation ? `<div>\u{1F4DD} <a style="color: violet" href="${diagnostic.documentation}" target="_blank">Learn more</a></div>` : ''}
      </div>
    `;
    }
    errorHTML += '</div>';
    overlay.innerHTML = errorHTML;
    return overlay;
}
function fullReload() {
    if (typeof location !== 'undefined' && 'reload' in location) location.reload();
    else if (typeof extCtx !== 'undefined' && extCtx && extCtx.runtime && extCtx.runtime.reload) extCtx.runtime.reload();
    else try {
        let { workerData, parentPort } = module.bundle.root('node:worker_threads') /*: any*/ ;
        if (workerData !== null && workerData !== void 0 && workerData.__parcel) parentPort.postMessage('restart');
    } catch (err) {
        console.error("[parcel] \u26A0\uFE0F An HMR update was not accepted. Please restart the process.");
    }
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var href = link.getAttribute('href');
    if (!href) return;
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute('href', // $FlowFixMe
    href.split('?')[0] + '?' + Date.now());
    // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout || typeof document === 'undefined') return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href /*: string */  = links[i].getAttribute('href');
            var hostname = getHostname();
            var servedFromHMRServer = hostname === 'localhost' ? new RegExp('^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):' + getPort()).test(href) : href.indexOf(hostname + ':' + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrDownload(asset) {
    if (asset.type === 'js') {
        if (typeof document !== 'undefined') {
            let script = document.createElement('script');
            script.src = asset.url + '?t=' + Date.now();
            if (asset.outputFormat === 'esmodule') script.type = 'module';
            return new Promise((resolve, reject)=>{
                var _document$head;
                script.onload = ()=>resolve(script);
                script.onerror = reject;
                (_document$head = document.head) === null || _document$head === void 0 || _document$head.appendChild(script);
            });
        } else if (typeof importScripts === 'function') {
            // Worker scripts
            if (asset.outputFormat === 'esmodule') return import(asset.url + '?t=' + Date.now());
            else return new Promise((resolve, reject)=>{
                try {
                    importScripts(asset.url + '?t=' + Date.now());
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
}
async function hmrApplyUpdates(assets) {
    global.parcelHotUpdate = Object.create(null);
    let scriptsToRemove;
    try {
        // If sourceURL comments aren't supported in eval, we need to load
        // the update from the dev server over HTTP so that stack traces
        // are correct in errors/logs. This is much slower than eval, so
        // we only do it if needed (currently just Safari).
        // https://bugs.webkit.org/show_bug.cgi?id=137297
        // This path is also taken if a CSP disallows eval.
        if (!supportsSourceURL) {
            let promises = assets.map((asset)=>{
                var _hmrDownload;
                return (_hmrDownload = hmrDownload(asset)) === null || _hmrDownload === void 0 ? void 0 : _hmrDownload.catch((err)=>{
                    // Web extension fix
                    if (extCtx && extCtx.runtime && extCtx.runtime.getManifest().manifest_version == 3 && typeof ServiceWorkerGlobalScope != 'undefined' && global instanceof ServiceWorkerGlobalScope) {
                        extCtx.runtime.reload();
                        return;
                    }
                    throw err;
                });
            });
            scriptsToRemove = await Promise.all(promises);
        }
        assets.forEach(function(asset) {
            hmrApply(module.bundle.root, asset);
        });
    } finally{
        delete global.parcelHotUpdate;
        if (scriptsToRemove) scriptsToRemove.forEach((script)=>{
            if (script) {
                var _document$head2;
                (_document$head2 = document.head) === null || _document$head2 === void 0 || _document$head2.removeChild(script);
            }
        });
    }
}
function hmrApply(bundle /*: ParcelRequire */ , asset /*:  HMRAsset */ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === 'css') reloadCSS();
    else if (asset.type === 'js') {
        let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                let oldDeps = modules[asset.id][1];
                for(let dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            if (supportsSourceURL) // Global eval. We would use `new Function` here but browser
            // support for source maps is better with eval.
            (0, eval)(asset.output);
            // $FlowFixMe
            let fn = global.parcelHotUpdate[asset.id];
            modules[asset.id] = [
                fn,
                deps
            ];
        }
        // Always traverse to the parent bundle, even if we already replaced the asset in this bundle.
        // This is required in case modules are duplicated. We need to ensure all instances have the updated code.
        if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id) {
    let modules = bundle.modules;
    if (!modules) return;
    if (modules[id]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        let deps = modules[id][1];
        let orphans = [];
        for(let dep in deps){
            let parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        }
        // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id];
        delete bundle.cache[id];
        // Now delete the orphans.
        orphans.forEach((id)=>{
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id);
}
function hmrAcceptCheck(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    checkedAssets = {};
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
    // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    let parents = getParents(module.bundle.root, id);
    let accepted = false;
    while(parents.length > 0){
        let v = parents.shift();
        let a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else if (a !== null) {
            // Otherwise, queue the parents in the next level upward.
            let p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push(...p);
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) {
            bundleNotFound = true;
            return true;
        }
        return hmrAcceptCheckOne(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return null;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    if (!cached) return true;
    assetsToDispose.push([
        bundle,
        id
    ]);
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
        assetsToAccept.push([
            bundle,
            id
        ]);
        return true;
    }
    return false;
}
function hmrDisposeQueue() {
    // Dispose all old assets.
    for(let i = 0; i < assetsToDispose.length; i++){
        let id = assetsToDispose[i][1];
        if (!disposedAssets[id]) {
            hmrDispose(assetsToDispose[i][0], id);
            disposedAssets[id] = true;
        }
    }
    assetsToDispose = [];
}
function hmrDispose(bundle /*: ParcelRequire */ , id /*: string */ ) {
    var cached = bundle.cache[id];
    bundle.hotData[id] = {};
    if (cached && cached.hot) cached.hot.data = bundle.hotData[id];
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData[id]);
    });
    delete bundle.cache[id];
}
function hmrAccept(bundle /*: ParcelRequire */ , id /*: string */ ) {
    // Execute the module.
    bundle(id);
    // Run the accept callbacks in the new version of the module.
    var cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
        let assetsToAlsoAccept = [];
        cached.hot._acceptCallbacks.forEach(function(cb) {
            let additionalAssets = cb(function() {
                return getParents(module.bundle.root, id);
            });
            if (Array.isArray(additionalAssets) && additionalAssets.length) assetsToAlsoAccept.push(...additionalAssets);
        });
        if (assetsToAlsoAccept.length) {
            let handled = assetsToAlsoAccept.every(function(a) {
                return hmrAcceptCheck(a[0], a[1]);
            });
            if (!handled) return fullReload();
            hmrDisposeQueue();
        }
    }
}

},{}],"27cw3":[function(require,module,exports,__globalThis) {
// js/assessment/main.js
// Main entry point for the assessment tool.
// Orchestrates all modules and handles the main application state.
var _authJs = require("./auth.js");
var _uiJs = require("./ui.js");
var _apiJs = require("./api.js");
var _scoringJs = require("./scoring.js");
var _resultsJs = require("./results.js");
// --- State ---
let currentAssessment = {};
// --- Core Functions ---
async function startAssessment() {
    _uiJs.showStep(3); // Show loading/analysis step
    const formData = getFormData();
    let toolData = await _apiJs.getToolFromDatabase(formData);
    if (toolData) {
        console.log('toolData from DB:', toolData); // Debug log
        // Ensure compliance_certifications is always an array of key-value strings
        let certs = [];
        if (Array.isArray(toolData.compliance_certifications)) certs = toolData.compliance_certifications;
        else if (toolData.compliance_certifications && typeof toolData.compliance_certifications === 'object') certs = Object.entries(toolData.compliance_certifications).map(([key, value])=>`${key}: ${value}`);
        currentAssessment = {
            formData: formData,
            finalScore: toolData.total_score,
            riskLevel: toolData.risk_level,
            source: 'database',
            breakdown: toolData.breakdown,
            recommendations: toolData.recommendations,
            detailedAssessment: toolData.detailed_assessment,
            // Add new fields from ai_tools
            vendor: toolData.vendor || null,
            license_type: toolData.license_type || null,
            primary_use_case: toolData.primary_use_case || null,
            assessed_by: toolData.assessed_by || null,
            confidence: toolData.confidence || null,
            documentation_tier: toolData.documentation_tier || null,
            assessment_notes: toolData.assessment_notes || null,
            azure_permissions: toolData.azure_permissions || null,
            sources: toolData.sources || null,
            // compliance_certifications is handled in API.saveToDatabase for the root level, 
            // but we ensure detailedAssessment.compliance_certifications is present for assessment_data
            compliance_certifications: toolData.compliance_certifications // Keep the object structure from ai_tools for detailedAssessment
        };
    } else {
        // Generate heuristic score
        const baseScore = _scoringJs.generateHeuristicScore(formData);
        const finalScore = _scoringJs.applyMultipliers(baseScore, formData);
        currentAssessment = {
            formData: formData,
            finalScore: finalScore,
            riskLevel: _scoringJs.getRiskLevel(finalScore),
            source: 'heuristic',
            breakdown: {
                scores: {}
            },
            recommendations: _scoringJs.generateRecommendations(finalScore, formData),
            // For heuristic, create a placeholder for detailedAssessment.compliance_certifications as an object
            detailedAssessment: {
                compliance_certifications: {
                    "HIPAA": {
                        "status": "Not Applicable"
                    },
                    "GDPR": {
                        "status": "Not Applicable"
                    },
                    "SOC_2": {
                        "status": "No"
                    },
                    "ISO_27001": {
                        "status": "No"
                    },
                    "PCI_DSS": {
                        "status": "Not Applicable"
                    },
                    "CCPA": {
                        "status": "Not Applicable"
                    },
                    "FedRAMP": {
                        "status": "Not Applicable"
                    }
                }
            },
            // Initialize other new fields for heuristic assessments
            vendor: null,
            license_type: null,
            primary_use_case: null,
            assessed_by: null,
            confidence: null,
            documentation_tier: null,
            assessment_notes: null,
            azure_permissions: null,
            sources: null
        };
    }
    simulateAnalysisSteps(async ()=>{
        // --- Auto-save to database ---
        console.log('Automatically saving assessment to database...');
        const { data: savedData, error: saveError } = await _apiJs.saveToDatabase(currentAssessment);
        if (saveError) {
            console.error('Auto-save failed:', saveError);
            _uiJs.showMessage(`Could not save assessment to your history: ${saveError.message}`, 'error');
        } else console.log('Auto-save successful:', savedData);
        // --- Show Results ---
        _uiJs.showStep(4);
        _resultsJs.displayResults(currentAssessment);
    });
}
// This function is no longer needed with auto-saving
/*
async function handleSaveToDatabase() {
    if (!Auth.getIsAdmin()) {
        UI.showMessage('You must be an admin to save assessments.', 'error');
        return;
    }
    if (!currentAssessment || !currentAssessment.results) {
        UI.showMessage('No assessment results to save.', 'error');
        return;
    }
    
    UI.showMessage('Saving...', 'info');
    const { data, error } = await API.saveToDatabase(currentAssessment);

    if (error) {
        UI.showMessage(`Error: ${error.message}`, 'error');
    } else {
        UI.showMessage('Assessment saved successfully!', 'success');
    }
}
*/ // --- Helper Functions ---
function getFormData() {
    const form = document.getElementById('assessmentForm');
    const formData = new FormData(form);
    return {
        toolName: formData.get('toolName'),
        toolVersion: formData.get('toolVersion'),
        toolCategory: formData.get('toolCategory'),
        dataClassification: formData.get('dataClassification'),
        useCase: formData.get('useCase')
    };
}
function simulateAnalysisSteps(callback) {
    const steps = [
        "Analyzing tool policies...",
        "Assessing data handling protocols...",
        "Evaluating vendor reputation...",
        "Cross-referencing compliance databases...",
        "Finalizing risk score..."
    ];
    let index = 0;
    const interval = setInterval(()=>{
        if (index < steps.length) {
            document.getElementById('analysisStatus').textContent = steps[index];
            index++;
        } else {
            clearInterval(interval);
            callback();
        }
    }, 600);
}
// --- Export Functions ---
// Export functionality moved to export.html page
// --- Initialization ---
function addEventListeners() {
    // Auth
    document.getElementById('signInTab')?.addEventListener('click', ()=>_authJs.switchAuthTab('signin'));
    document.getElementById('signUpTab')?.addEventListener('click', ()=>_authJs.switchAuthTab('signup'));
    document.getElementById('signInBtn')?.addEventListener('click', _authJs.signInUser);
    document.getElementById('signUpBtn')?.addEventListener('click', _authJs.signUpUser);
    document.getElementById('closeAuthModalBtn')?.addEventListener('click', _authJs.closeAuthModal);
    // Step Navigation
    document.getElementById('nextStepBtn1')?.addEventListener('click', ()=>_uiJs.nextStep(startAssessment));
    document.getElementById('nextStepBtn2')?.addEventListener('click', ()=>_uiJs.nextStep(startAssessment));
    document.getElementById('prevStepBtn2')?.addEventListener('click', _uiJs.prevStep);
    // Results and Exports
    document.getElementById('newAssessmentBtn')?.addEventListener('click', _uiJs.startNewAssessment);
// The dynamic save button and its handler are no longer needed
/*
    document.querySelector('.form-content').addEventListener('click', (e) => {
        if (e.target.matches('#saveToDbBtn') || e.target.closest('#saveToDbBtn')) {
            handleSaveToDatabase();
        }
    });
    */ // Export functionality moved to export.html page
// The export button now links directly to export.html
}
function initialize() {
    // Event Listeners
    _uiJs.setupEventListeners({
        onStartAssessment: startAssessment,
        onStartNew: _uiJs.startNewAssessment,
        onLogin: _authJs.showAuthModal,
        signOut: _authJs.signOut,
        showAuthModal: _authJs.showAuthModal,
        closeAuthModal: _authJs.closeAuthModal
    });
    // Initialize Supabase and handle auth changes
    _authJs.initializeSupabase((user)=>{
        _uiJs.updateUIForAuth(user);
    });
    _uiJs.showStep(1);
    addEventListeners();
}
document.addEventListener('DOMContentLoaded', initialize);

},{"./auth.js":"lndTA","./ui.js":"aNoDE","./api.js":"3q7Ls","./scoring.js":"2mnUO","./results.js":"f0hqN"}],"lndTA":[function(require,module,exports,__globalThis) {
// js/assessment/auth.js
// Handles user authentication, session management, and Supabase client initialization.
// --- Configuration ---
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "supabase", ()=>(0, _supabaseClientJs.supabase));
// --- Public Functions ---
parcelHelpers.export(exports, "initializeSupabase", ()=>initializeSupabase);
parcelHelpers.export(exports, "signInUser", ()=>signInUser);
parcelHelpers.export(exports, "signUpUser", ()=>signUpUser);
parcelHelpers.export(exports, "signOut", ()=>signOut);
parcelHelpers.export(exports, "getCurrentUser", ()=>getCurrentUser);
parcelHelpers.export(exports, "getIsAdmin", ()=>getIsAdmin);
parcelHelpers.export(exports, "getIsEnterprise", ()=>getIsEnterprise);
parcelHelpers.export(exports, "getIsFree", ()=>getIsFree);
// --- Auth Modal Logic ---
parcelHelpers.export(exports, "showAuthModal", ()=>showAuthModal);
parcelHelpers.export(exports, "closeAuthModal", ()=>closeAuthModal);
parcelHelpers.export(exports, "switchAuthTab", ()=>switchAuthTab);
var _supabaseClientJs = require("../supabase-client.js");
// --- State ---
let currentUser = null;
let isAdmin = false;
function initializeSupabase(onAuthStateChange) {
    console.log('Supabase client initialized.');
    (0, _supabaseClientJs.supabase).auth.onAuthStateChange((event, session)=>{
        currentUser = session?.user || null;
        isAdmin = session?.user?.user_metadata?.role === 'admin';
        onAuthStateChange(); // Callback to update UI
    });
}
async function signInUser() {
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    try {
        const { error } = await (0, _supabaseClientJs.supabase).auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        alert('Signed in successfully');
        closeAuthModal();
    } catch (error) {
        console.error('Sign in error:', error);
        alert('Sign in failed: ' + error.message);
    }
}
async function signUpUser() {
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    const tier = document.getElementById('signUpTier').value;
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    try {
        const { error } = await (0, _supabaseClientJs.supabase).auth.signUp({
            email,
            password,
            options: {
                data: {
                    tier
                }
            }
        });
        if (error) throw error;
        alert('Account created! Please check your email for verification.');
        closeAuthModal();
    } catch (error) {
        console.error('Sign up error:', error);
        alert('Sign up failed: ' + error.message);
    }
}
async function signOut() {
    try {
        const { error } = await (0, _supabaseClientJs.supabase).auth.signOut();
        if (error) throw error;
        alert('Signed out successfully');
    } catch (error) {
        console.error('Sign out error:', error);
        alert('Sign out failed: ' + error.message);
    }
}
function getCurrentUser() {
    return currentUser;
}
function getIsAdmin() {
    return isAdmin;
}
function getIsEnterprise() {
    return currentUser?.user_metadata?.tier === 'enterprise';
}
function getIsFree() {
    return !currentUser?.user_metadata?.tier || currentUser.user_metadata.tier === 'free';
}
function showAuthModal(tab = 'signin') {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
        switchAuthTab(tab);
    }
}
function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'none';
}
function switchAuthTab(tab) {
    document.getElementById('signInTab').classList.toggle('active', tab === 'signin');
    document.getElementById('signUpTab').classList.toggle('active', tab === 'signup');
    document.getElementById('signInForm').classList.toggle('active', tab === 'signin');
    document.getElementById('signUpForm').classList.toggle('active', tab === 'signup');
}

},{"../supabase-client.js":"eoCsO","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"aNoDE":[function(require,module,exports,__globalThis) {
// js/assessment/ui.js
// Handles UI updates, step navigation, and general DOM manipulation.
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// --- Step Navigation ---
parcelHelpers.export(exports, "nextStep", ()=>nextStep);
parcelHelpers.export(exports, "prevStep", ()=>prevStep);
parcelHelpers.export(exports, "showStep", ()=>showStep);
parcelHelpers.export(exports, "startNewAssessment", ()=>startNewAssessment);
// --- UI Updates ---
parcelHelpers.export(exports, "updateUIForAuth", ()=>updateUIForAuth);
parcelHelpers.export(exports, "showMessage", ()=>showMessage);
// --- Event Listeners Setup ---
parcelHelpers.export(exports, "setupEventListeners", ()=>setupEventListeners);
var _authJs = require("./auth.js");
let currentStep = 1;
function nextStep(onStartAssessment) {
    let isValid = false;
    if (currentStep === 1) isValid = validateStep1();
    else if (currentStep === 2) isValid = validateStep2();
    else isValid = true;
    if (isValid) {
        currentStep++;
        if (currentStep === 3) onStartAssessment(); // Callback to main.js
        else showStep(currentStep);
    }
}
function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}
function showStep(step) {
    document.querySelectorAll('.step-section').forEach((section)=>{
        section.classList.remove('active');
    });
    document.getElementById(`section${step}`).classList.add('active');
    document.querySelectorAll('.progress-step').forEach((stepEl, index)=>{
        stepEl.classList.remove('active', 'completed');
        if (index + 1 < step) stepEl.classList.add('completed');
        else if (index + 1 === step) stepEl.classList.add('active');
    });
    currentStep = step;
}
function startNewAssessment() {
    showStep(1);
    document.getElementById('assessmentForm').reset();
    document.querySelectorAll('.classification-option.selected').forEach((el)=>{
        el.classList.remove('selected');
    });
}
function updateUIForAuth() {
    const loginSection = document.getElementById('loginSection');
    const currentUser = (0, _authJs.getCurrentUser)();
    // The "Save to Database" button is no longer needed with auto-saving.
    // This entire block can be removed.
    /*
    const isAdmin = getIsAdmin();
    const resultsBtnGroup = document.querySelector('#section4 .btn-group');
    const saveBtn = document.getElementById('saveToDbBtn');

    if (currentUser) {
        if (resultsBtnGroup && !saveBtn) {
            const saveButtonHTML = `
                <button type="button" class="btn btn-secondary" id="saveToDbBtn">
                    <i data-lucide="save" class="w-4 h-4"></i> Save Assessment
                </button>
            `;
            const newAssessmentBtn = document.getElementById('newAssessmentBtn');
            if (newAssessmentBtn) {
                newAssessmentBtn.insertAdjacentHTML('beforebegin', saveButtonHTML);
            }
        }
    } else {
        if (saveBtn) {
            saveBtn.remove();
        }
    }
    */ if (loginSection) {
        if (currentUser) {
            const userTier = currentUser.user_metadata?.tier || 'free';
            const dashClass = (0, _authJs.getIsAdmin)() ? 'btn btn-primary' : 'btn btn-secondary';
            loginSection.innerHTML = `
                <div class="login-user"><i data-lucide="check-circle" class="w-4 h-4"></i><span>${currentUser.email}</span></div>
                <div class="login-badges">
                    ${(0, _authJs.getIsEnterprise)() ? '<span class="badge badge-enterprise">ENTERPRISE</span>' : ''}
                    ${(0, _authJs.getIsAdmin)() ? '<span class="badge badge-admin">ADMIN</span>' : ''}
                </div>
                <div class="login-actions">
                    <a href="dashboard.html" class="${dashClass}"><i data-lucide="gauge" class="w-4 h-4"></i> Dashboard</a>
                    <button id="signOutBtn" class="btn btn-secondary"><i data-lucide="log-out" class="w-4 h-4"></i> Sign Out</button>
                </div>
            `;
        } else loginSection.innerHTML = `
                <div class="login-user"><i data-lucide="lock" class="w-4 h-4"></i><span>Sign in to save & export</span></div>
                <div class="login-actions">
                    <button id="showSignInModalBtn" class="btn btn-primary"><i data-lucide="log-in" class="w-4 h-4"></i> Sign In</button>
                    <button id="showSignUpModalBtn" class="btn btn-secondary"><i data-lucide="user-plus" class="w-4 h-4"></i> Create Account</button>
                </div>
            `;
        // Reinitialize Lucide icons after dynamic content creation
        if (typeof lucide !== 'undefined') setTimeout(()=>lucide.createIcons(), 100);
    }
}
function showMessage(message, type = 'success') {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message message-${type}`;
    messageContainer.textContent = message;
    const formContent = document.querySelector('.form-content');
    formContent.prepend(messageContainer);
    setTimeout(()=>{
        messageContainer.style.opacity = '0';
        setTimeout(()=>messageContainer.remove(), 500);
    }, 5000);
}
// --- Validation ---
function validateStep1() {
    const toolName = document.getElementById('toolName').value.trim();
    if (!toolName) {
        showMessage('Please enter a tool name', 'error');
        return false;
    }
    return true;
}
function validateStep2() {
    const dataClassification = document.querySelector('input[name="dataClassification"]:checked');
    if (!dataClassification) {
        showMessage('Please select a data classification', 'error');
        return false;
    }
    return true;
}
function setupEventListeners(callbacks) {
    const modal = document.getElementById('authModal');
    if (modal) modal.addEventListener('click', (e)=>{
        if (e.target === modal) callbacks.closeAuthModal();
    });
    // Event delegation for dynamically created auth buttons
    const loginSection = document.getElementById('loginSection');
    if (loginSection) loginSection.addEventListener('click', (e)=>{
        if (e.target.closest('#signOutBtn')) callbacks.signOut();
        else if (e.target.closest('#showSignInModalBtn')) callbacks.showAuthModal('signin');
        else if (e.target.closest('#showSignUpModalBtn')) callbacks.showAuthModal('signup');
    });
    document.addEventListener('change', function(e) {
        if (e.target.name === 'dataClassification') {
            document.querySelectorAll('.classification-option').forEach((option)=>{
                option.classList.remove('selected');
            });
            e.target.closest('.classification-option').classList.add('selected');
        }
    });
}

},{"./auth.js":"lndTA","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"3q7Ls":[function(require,module,exports,__globalThis) {
// js/assessment/api.js
// Handles all API calls to the Supabase backend.
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getToolFromDatabase", ()=>getToolFromDatabase);
parcelHelpers.export(exports, "saveToDatabase", ()=>saveToDatabase);
var _authJs = require("./auth.js");
var _scoringJs = require("./scoring.js");
async function getToolFromDatabase(formData) {
    if (!(0, _authJs.supabase)) {
        console.warn('Supabase client not available for DB check.');
        return null;
    }
    const toolName = formData.toolName.trim();
    const toolVersion = formData.toolVersion.trim();
    console.log(`Searching DB for: ${toolName} (Version: ${toolVersion})`);
    try {
        // --- Attempt 1: Exact Phrase Match (e.g., "ChatGPT Free") ---
        const exactPhrase = `${toolName} ${toolVersion}`;
        console.log(`Attempt 1: Case-insensitive exact match for "${exactPhrase}"`);
        let { data, error } = await (0, _authJs.supabase).from('ai_tools').select('*').ilike('name', exactPhrase).limit(1);
        if (data && data.length > 0) {
            console.log('Success (Attempt 1): Found exact phrase match.', data[0]);
            return (0, _scoringJs.applyClientSideMultipliers)(data[0], formData);
        }
        // --- Attempt 2: Keyword Match (name contains both toolName and toolVersion) ---
        console.log(`Attempt 2: Keyword match for "${toolName}" and "${toolVersion}"`);
        ({ data, error } = await (0, _authJs.supabase).from('ai_tools').select('*').ilike('name', `%${toolName}%`).ilike('name', `%${toolVersion}%`).limit(1));
        if (data && data.length > 0) {
            console.log('Success (Attempt 2): Found keyword match.', data[0]);
            return (0, _scoringJs.applyClientSideMultipliers)(data[0], formData);
        }
        // --- Attempt 3: Base Name Match (name contains only the toolName) ---
        console.log(`Attempt 3: Base name match for "${toolName}"`);
        ({ data, error } = await (0, _authJs.supabase).from('ai_tools').select('*').ilike('name', `%${toolName}%`)// Sort by creation date to get the most recent one if multiple exist
        .order('created_at', {
            ascending: false
        }).limit(1));
        if (data && data.length > 0) {
            console.log('Success (Attempt 3): Found base name match.', data[0]);
            return (0, _scoringJs.applyClientSideMultipliers)(data[0], formData);
        }
        if (error) {
            console.error('Database query failed after all attempts:', error);
            return null;
        }
        console.log('No assessment found in database after all attempts.');
        return null;
    } catch (err) {
        console.error('Critical error in getToolFromDatabase:', err);
        return null;
    }
}
async function saveToDatabase(assessment) {
    if (!(0, _authJs.supabase)) return {
        error: {
            message: 'Not connected to database.'
        }
    };
    const { formData, finalScore, breakdown, recommendations } = assessment;
    const user = (0, _authJs.getCurrentUser)();
    if (!user) return {
        error: {
            message: 'User must be logged in to save an assessment.'
        }
    };
    // Defensively re-calculate risk level to ensure it's always valid for the DB.
    const validRiskLevel = (0, _scoringJs.getRiskLevel)(finalScore);
    // Store all details in assessment_data
    const record = {
        user_id: user.id,
        name: formData.toolName,
        vendor: assessment.vendor || null,
        license_type: assessment.license_type || null,
        primary_use_case: assessment.primary_use_case || null,
        data_classification: formData.dataClassification,
        category: formData.toolCategory,
        total_score: finalScore,
        risk_level: validRiskLevel,
        data_storage_score: breakdown?.scores?.dataStorage ?? 0,
        training_usage_score: breakdown?.scores?.trainingUsage ?? 0,
        access_controls_score: breakdown?.scores?.accessControls ?? 0,
        compliance_score: breakdown?.scores?.complianceRisk ?? 0,
        vendor_transparency_score: breakdown?.scores?.vendorTransparency ?? 0,
        // Add explicit mapping for the missing root-level fields
        assessed_by: assessment.assessed_by || null,
        confidence: assessment.confidence || null,
        documentation_tier: assessment.documentation_tier || null,
        assessment_notes: assessment.assessment_notes || null,
        azure_permissions: assessment.azure_permissions || null,
        sources: assessment.sources || null,
        // Map compliance_certifications to an array of strings for the top-level column
        compliance_certifications: assessment.compliance_certifications ? Object.keys(assessment.compliance_certifications).filter((key)=>assessment.compliance_certifications[key]?.status && assessment.compliance_certifications[key].status !== 'Not Applicable' && assessment.compliance_certifications[key].status !== 'No').map((key)=>`${key}: ${assessment.compliance_certifications[key].status}`) : [],
        // Store the full assessment object in assessment_data, ensuring it includes all details
        assessment_data: {
            source: assessment.source,
            formData: assessment.formData,
            finalScore: assessment.finalScore,
            riskLevel: assessment.riskLevel,
            breakdown: assessment.breakdown,
            recommendations: assessment.recommendations,
            detailedAssessment: assessment.detailedAssessment,
            // Ensure data_classification and category are populated within assessment_data
            data_classification: assessment.data_classification || formData.dataClassification,
            category: assessment.category || formData.toolCategory,
            // Include other top-level fields from ai_tools if they are not already part of detailedAssessment
            primary_use_case: assessment.primary_use_case || null,
            assessed_by: assessment.assessed_by || null,
            confidence: assessment.confidence || null,
            documentation_tier: assessment.documentation_tier || null,
            assessment_notes: assessment.assessment_notes || null,
            azure_permissions: assessment.azure_permissions || null,
            sources: assessment.sources || null
        }
    };
    try {
        const { data, error } = await (0, _authJs.supabase).from('assessments').insert([
            record
        ]).select();
        if (error) {
            // Check for unique constraint violation
            if (error.code === '23505') {
                console.warn(`Tool "${record.name}" already exists. Consider an update?`);
                return {
                    error: {
                        message: `An assessment for "${record.name}" already exists.`
                    }
                };
            }
            throw error;
        }
        // Increment total assessments created counter
        await incrementTotalAssessmentsCreated();
        console.log('Successfully saved to database:', data);
        return {
            data
        };
    } catch (error) {
        console.error('Error saving to database:', error);
        return {
            error
        };
    }
}
// New function to increment the total assessments created counter
async function incrementTotalAssessmentsCreated() {
    const user = (0, _authJs.getCurrentUser)();
    if (!user) return;
    try {
        const currentTotal = user.user_metadata?.total_assessments_created || 0;
        const newTotal = currentTotal + 1;
        const { error } = await (0, _authJs.supabase).auth.updateUser({
            data: {
                total_assessments_created: newTotal
            }
        });
        if (error) console.error('Failed to update total assessments created:', error);
        else console.log(`Updated total assessments created: ${currentTotal} \u{2192} ${newTotal}`);
    } catch (error) {
        console.error('Error incrementing total assessments created:', error);
    }
}

},{"./auth.js":"lndTA","./scoring.js":"2mnUO","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"2mnUO":[function(require,module,exports,__globalThis) {
// js/assessment/scoring.js
// Contains all business logic for calculating risk scores.
// --- Constants ---
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// --- Public Functions ---
parcelHelpers.export(exports, "generateHeuristicScore", ()=>generateHeuristicScore);
parcelHelpers.export(exports, "applyMultipliers", ()=>applyMultipliers);
parcelHelpers.export(exports, "applyClientSideMultipliers", ()=>applyClientSideMultipliers);
parcelHelpers.export(exports, "getRiskLevel", ()=>getRiskLevel);
parcelHelpers.export(exports, "generateRecommendations", ()=>generateRecommendations);
const DATA_CLASSIFICATION_MULTIPLIERS = {
    'phi': 1.4,
    'financial': 1.3,
    'trade-secrets': 1.25,
    'pii': 1.2,
    'public': 0.9
};
const USE_CASE_MULTIPLIERS = {
    'legal-compliance': 1.3,
    'finance-accounting': 1.2,
    'hr-executive': 1.15,
    'customer-support': 1.1,
    'development': 0.95,
    'marketing': 0.9,
    'research': 1.0,
    'general': 1.0
};
function generateHeuristicScore(formData) {
    let score = 60; // Higher default for unknown tools
    if (formData.toolVersion === 'enterprise') score -= 15;
    if (formData.toolCategory === 'conversational-ai') score += 15;
    else if (formData.toolCategory === 'code-assistant') score += 5;
    else if (formData.toolCategory === 'productivity') score += 10;
    return Math.min(100, Math.max(20, score));
}
function applyMultipliers(baseScore, formData) {
    let finalScore = baseScore;
    const dataMultiplier = DATA_CLASSIFICATION_MULTIPLIERS[formData.dataClassification] || 1;
    const useCaseMultiplier = USE_CASE_MULTIPLIERS[formData.useCase] || 1;
    finalScore *= dataMultiplier;
    finalScore *= useCaseMultiplier;
    return Math.round(finalScore);
}
function applyClientSideMultipliers(dbData, formData) {
    if (!dbData) return null;
    const baseScores = {
        dataStorage: dbData.data_storage_score || 0,
        trainingUsage: dbData.training_usage_score || 0,
        accessControls: dbData.access_controls_score || 0,
        complianceRisk: dbData.compliance_score || 0,
        vendorTransparency: dbData.vendor_transparency_score || 0
    };
    const dataMultiplier = DATA_CLASSIFICATION_MULTIPLIERS[formData.dataClassification] || 1.0;
    baseScores.dataStorage = Math.round(baseScores.dataStorage * dataMultiplier);
    baseScores.complianceRisk = Math.round(baseScores.complianceRisk * dataMultiplier);
    const useCaseMultiplier = USE_CASE_MULTIPLIERS[formData.useCase] || 1.0;
    baseScores.complianceRisk = Math.round(baseScores.complianceRisk * useCaseMultiplier);
    baseScores.accessControls = Math.round(baseScores.accessControls * useCaseMultiplier);
    const totalScore = Object.values(baseScores).reduce((sum, score)=>sum + score, 0);
    // Return a structure that mimics the original toolData object for consistency
    return {
        ...dbData,
        total_score: totalScore,
        compliance_certifications: dbData.compliance_certifications || [],
        breakdown: {
            ...dbData.breakdown,
            scores: baseScores
        }
    };
}
function getRiskLevel(score) {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 35) return 'medium';
    return 'low';
}
function generateRecommendations(score, formData) {
    const riskLevel = getRiskLevel(score);
    const dataType = formData.dataClassification;
    let recommendations = [];
    if (riskLevel === 'critical') {
        recommendations.push('IMMEDIATE ACTION REQUIRED: This tool should not be used with the selected data type.');
        recommendations.push('Consider enterprise alternatives with stronger security controls.');
    } else if (riskLevel === 'high') {
        recommendations.push('Significant security controls required before deployment.');
        recommendations.push('Implement data loss prevention (DLP) policies and review access.');
    }
    if (dataType === 'phi') recommendations.push('HIPAA compliance verification and a signed Business Associate Agreement (BAA) are required.');
    else if (dataType === 'financial') recommendations.push('PCI-DSS and SOX compliance must be verified for the intended use case.');
    if (recommendations.length === 0) recommendations.push('Standard security monitoring and user awareness training are recommended.');
    return recommendations;
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"f0hqN":[function(require,module,exports,__globalThis) {
// js/assessment/results.js
// Handles rendering the results page and managing export functions.
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "displayResults", ()=>displayResults);
var _scoringJs = require("./scoring.js");
var _authJs = require("./auth.js");
let currentAssessment = null;
function displayResults(results) {
    currentAssessment = results; // Cache the full results object
    const resultsContainer = document.getElementById('resultsContent');
    if (!resultsContainer) {
        console.error("Could not find resultsContent element to display results.");
        return;
    }
    // Clear loading state
    resultsContainer.innerHTML = '';
    const { formData, finalScore, riskLevel, source, recommendations, breakdown, detailedAssessment } = results;
    const toolName = formData.toolName || 'Unknown Tool';
    const toolVersion = formData.toolVersion || '';
    const fullToolName = toolVersion ? `${toolName} (${toolVersion})` : toolName;
    // Build the results HTML
    const resultsHTML = `
        <div class="results-layout">
            <!-- Main Score Card -->
            <div class="main-score-card risk-${riskLevel.toLowerCase()}">
                <div class="tool-title" style="font-size:1.25rem;font-weight:600;margin-bottom:0.5rem;">${fullToolName}</div>
                <div class="score-section">
                    <div id="mainScore" class="score-number">${finalScore}</div>
                    <div id="riskLevel" class="score-label">${riskLevel}</div>
                </div>
                <div id="scoreDescription" class="score-description">
                    <p>${getScoreDescription(finalScore, riskLevel, toolName)}</p>
                    <div id="dataSource" class="data-source ${source}">
                        ${source === 'database' ? 'Based on Verified Assessment' : 'Based on Heuristic Analysis'}
                    </div>
                </div>
            </div>
            
            <!-- Insights Grid -->
            <div id="insightsGrid" class="insights-grid">
                <!-- Insight cards will be populated here -->
            </div>
            
            <!-- Recommendations Section -->
            <div class="recommendations-section">
                <div class="recommendations-section__header">
                    <h3 class="recommendations-section__title">Recommendations</h3>
                </div>
                <ul id="recommendationsList" class="recommendations-section__grid">
                    <!-- Recommendations will be populated here -->
                </ul>
            </div>
            
            <!-- Detailed Breakdown -->
            <div id="detailedBreakdown" class="detailed-breakdown-section">
                <!-- Detailed breakdown will be populated here -->
            </div>
        </div>
    `;
    resultsContainer.innerHTML = resultsHTML;
    // Now that the DOM is updated, render the components
    renderInsights(breakdown);
    renderRecommendations(recommendations, finalScore, formData);
    // Prioritize the complete 'detailedAssessment' object, but fall back to 'breakdown.subScores'
    const breakdownData = detailedAssessment || (breakdown ? breakdown.subScores : null);
    renderDetailedBreakdown(breakdownData);
// All old export functions will be removed from this file.
// New export functionality is handled by docs/js/dashboard/export.js
}
function renderInsights(breakdown) {
    const insightsGrid = document.getElementById('insightsGrid');
    const scores = breakdown?.scores || {};
    const insights = [
        {
            title: 'Data Storage & Security',
            score: scores.dataStorage,
            icon: 'database'
        },
        {
            title: 'Training Data Usage',
            score: scores.trainingUsage,
            icon: 'robot'
        },
        {
            title: 'Access Controls',
            score: scores.accessControls,
            icon: 'key'
        },
        {
            title: 'Compliance & Legal',
            score: scores.complianceRisk,
            icon: 'gavel'
        },
        {
            title: 'Vendor Transparency',
            score: scores.vendorTransparency,
            icon: 'eye'
        }
    ];
    insightsGrid.innerHTML = insights.map((item)=>`
        <div class="insight-card risk-${(0, _scoringJs.getRiskLevel)(item.score ?? 0).toLowerCase()}">
            <div class="insight-icon"><i data-lucide="${item.icon}" class="w-5 h-5"></i></div>
            <div class="insight-content">
                <span class="insight-title">${item.title}</span>
                <span class="insight-value">${item.score ?? 'N/A'}</span>
            </div>
        </div>
    `).join('');
    // Reinitialize Lucide icons after dynamic content creation
    if (typeof lucide !== 'undefined') lucide.createIcons();
}
function renderRecommendations(recommendations, finalScore, formData) {
    const recommendationsList = document.getElementById('recommendationsList');
    let recs = recommendations || (0, _scoringJs.generateRecommendations)(finalScore, formData);
    // Handle the case where recommendations might be objects or strings
    if (recs && Array.isArray(recs)) recs = recs.map((rec)=>{
        if (typeof rec === 'string') return rec;
        else if (typeof rec === 'object' && rec !== null) // Handle recommendation objects - try common property names
        return rec.text || rec.description || rec.title || rec.recommendation || JSON.stringify(rec);
        return String(rec);
    });
    else if (typeof recs === 'object' && recs !== null) // If recommendations is a single object, convert to array
    recs = [
        recs.text || recs.description || recs.title || JSON.stringify(recs)
    ];
    else // Fallback to generating new recommendations
    recs = (0, _scoringJs.generateRecommendations)(finalScore, formData);
    recommendationsList.innerHTML = recs.map((rec)=>`
        <li class="recommendation-item">
            <span class="rec-bullet">\u{2022}</span>
            <span class="rec-text">${rec}</span>
        </li>
    `).join('');
}
function renderDetailedBreakdown(breakdownData) {
    const container = document.getElementById('detailedBreakdown');
    const details = breakdownData?.assessment_details;
    if (!details || typeof details !== 'object' || Object.keys(details).length === 0) {
        container.innerHTML = `
            <div class="detailed-breakdown-section__header">
                <h3 class="detailed-breakdown-section__title">Detailed Breakdown</h3>
            </div>
            <p class="no-breakdown">No detailed breakdown available for this assessment.</p>
        `;
        return;
    }
    let html = '<div class="detailed-breakdown-section__header"><h3 class="detailed-breakdown-section__title">Detailed Breakdown</h3></div><div class="detailed-breakdown-section__categories-grid">';
    for (const [categoryName, categoryObject] of Object.entries(details)){
        if (!categoryObject || typeof categoryObject !== 'object') continue;
        html += `
            <div class="breakdown-card">
                <div class="breakdown-header">
                    <h4 class="breakdown-title">${formatCategoryName(categoryName)}</h4>
                </div>
                <div class="breakdown-content">
        `;
        let hasContent = false;
        for (const [itemName, itemObject] of Object.entries(categoryObject.criteria || categoryObject))if (itemObject && typeof itemObject === 'object') {
            hasContent = true;
            html += `
                    <div class="breakdown-item">
                        <div class="breakdown-item-header">
                            <span class="breakdown-item-title">${formatItemName(itemName)}</span>
                            <span class="breakdown-score">${itemObject.score ?? 'N/A'}</span>
                        </div>
                        <div class="breakdown-item-note">${itemObject.justification || itemObject.note || itemObject.description || 'No details available'}</div>
                    </div>
                `;
        }
        if (!hasContent) html += `<div class="breakdown-item-note">No detailed points available for this category.</div>`;
        html += `</div></div>`;
    }
    html += '</div>';
    container.innerHTML = html;
}
// Helper functions for formatting
function formatCategoryName(category) {
    // Replace underscores with spaces and title-case each word
    return category.replace(/_/g, ' ').replace(/\b\w/g, (char)=>char.toUpperCase()).trim();
}
function formatItemName(item) {
    // Similar humanization for item names
    return item.replace(/_/g, ' ').replace(/\b\w/g, (char)=>char.toUpperCase()).trim();
}
function getScoreDescription(score, level, toolName) {
    let description = '';
    const risk = level.toLowerCase();
    if (risk === 'critical') description = `<strong>Immediate Action Required.</strong> With a score of ${score}, ${toolName} poses a critical risk.`;
    else if (risk === 'high') description = `<strong>Requires Review.</strong> With a score of ${score}, ${toolName} poses a high risk.`;
    else if (risk === 'medium') description = `<strong>Use With Caution.</strong> With a score of ${score}, ${toolName} presents a medium risk.`;
    else description = `<strong>Approved for General Use.</strong> With a score of ${score}, ${toolName} is considered low risk.`;
    return description;
} // --- Export Functions ---
 // All old export functions will be removed from this file.
 // New export functionality is handled by docs/js/dashboard/export.js

},{"./scoring.js":"2mnUO","./auth.js":"lndTA","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}]},["6IEMQ","27cw3"], "27cw3", "parcelRequire4b35", {})

//# sourceMappingURL=docs.9a1acb47.js.map
