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
})({"kirti":[function(require,module,exports,__globalThis) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SERVER_PORT = 8080;
var HMR_SECURE = false;
var HMR_ENV_HASH = "439701173a9199ea";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "ee7cde1e74e1f630";
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

},{}],"80B5u":[function(require,module,exports,__globalThis) {
// js/dashboard/main.js
// Main entry point for the dashboard application.
// Initializes the app, loads modules, and coordinates everything.
var _authJs = require("./auth.js");
var _assessmentsJs = require("./assessments.js");
var _importJs = require("./import.js");
var _gamificationJs = require("./gamification.js");
var _achievementsJs = require("./achievements.js");
var _uiJs = require("./ui.js");
var _adminUiJs = require("./admin-ui.js");
var _compareJs = require("./compare.js");
var _supabaseClientJs = require("../supabase-client.js");
let currentTab = 'dashboard';
// Make functions available globally BEFORE DOMContentLoaded
// so that inline onclick handlers in the HTML can call them immediately
window.switchTab = (0, _uiJs.switchTab);
window.viewAssessment = (0, _assessmentsJs.viewAssessment);
window.deleteAssessment = async (id)=>{
    await (0, _assessmentsJs.deleteAssessment)(id);
    // Refresh achievements after deletion
    if (window.achievementsManager) window.achievementsManager.updateProgress();
};
window.loadAssessments = (0, _assessmentsJs.loadAssessments);
window.clearAllFilters = (0, _assessmentsJs.clearAllFiltersLegacy); // Use the legacy function
window.clearAllFiltersLegacy = (0, _assessmentsJs.clearAllFiltersLegacy); // Also export with the new name
window.closeBanner = (0, _uiJs.closeBanner);
window.handleFileSelect = (0, _importJs.handleFileSelect);
window.processImport = (0, _importJs.processImport);
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Modern Dashboard initializing...');
    // Check if Supabase client is available
    if (!window.supabaseClient) {
        console.error('Supabase client is not initialized. Please check your configuration.');
        return;
    }
    console.log('Supabase client is ready, proceeding with dashboard initialization.');
    (0, _importJs.initImport)(window.supabaseClient);
    const isAuthenticated = await (0, _authJs.checkAuth)();
    if (isAuthenticated) await initializeDashboard();
    else {
        const mainContent = document.querySelector('.flex-1.p-6');
        if (mainContent) mainContent.innerHTML = `
                <div class="text-center p-10 bg-gray-800 rounded-lg">
                    <h2 class="text-2xl font-bold mb-2">Access Denied</h2>
                    <p class="text-gray-400">Please sign in to view the dashboard.</p>
                    <a href="index.html" class="mt-4 inline-block bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Go to Sign In
                    </a>
                </div>
            `;
    }
    (0, _uiJs.setupEventListeners)();
    (0, _compareJs.setupEventListeners)();
    if (typeof lucide !== 'undefined') lucide.createIcons();
});
async function initializeDashboard() {
    try {
        const isAdminUser = (0, _authJs.getIsAdmin)();
        console.log('Is Admin User:', isAdminUser);
        console.log('Current user metadata:', (0, _authJs.getCurrentUser)()?.user_metadata);
        if (isAdminUser) {
            console.log('Injecting admin UI...');
            (0, _adminUiJs.injectDashboardAdminUI)();
        } else console.log('User is not admin, skipping admin UI injection');
        // Wrap loadAssessments in a more robust error handler
        try {
            await (0, _assessmentsJs.loadAssessments)();
        } catch (loadError) {
            console.error('Failed to load assessments:', loadError);
            // Render a user-friendly error message
            const container = document.getElementById('assessment-list');
            if (container) {
                container.innerHTML = `
                    <div class="error-state-container">
                        <i data-lucide="alert-triangle" class="error-icon text-red-500"></i>
                        <h3 class="error-title text-lg font-bold">Unable to Load Assessments</h3>
                        <p class="error-message text-gray-400">
                            We couldn't retrieve your assessments at this time. 
                            This could be due to a network issue or temporary service disruption.
                        </p>
                        <button onclick="loadAssessments()" class="btn btn-secondary mt-4">
                            <i data-lucide="refresh-cw" class="w-4 h-4 mr-2"></i>
                            Retry Loading
                        </button>
                    </div>
                `;
                // Reinitialize Lucide icons
                if (typeof lucide !== 'undefined') setTimeout(()=>lucide.createIcons(), 100);
            }
        }
        (0, _gamificationJs.updateDashboardStats)();
        (0, _gamificationJs.updateProgressTracking)();
        // Initialize achievements
        window.achievementsManager = new (0, _achievementsJs.AchievementsManager)();
        window.achievementsManager.initialize();
        (0, _uiJs.updateTierBadge)();
        console.log('Dashboard initialized successfully');
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        // Render a global error state
        const mainContent = document.querySelector('.flex-1.p-6');
        if (mainContent) mainContent.innerHTML = `
                <div class="text-center p-10 bg-gray-800 rounded-lg">
                    <h2 class="text-2xl font-bold mb-2 text-red-500">Dashboard Initialization Failed</h2>
                    <p class="text-gray-400">We encountered an unexpected error. Please try refreshing the page.</p>
                    <button onclick="window.location.reload()" class="mt-4 inline-block bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Reload Page
                    </button>
                </div>
            `;
    }
}

},{"./auth.js":"2bucD","./assessments.js":"9eYtm","./import.js":"8JRbO","./gamification.js":"lUSAA","./achievements.js":"fPGsB","./ui.js":"lhVUw","./admin-ui.js":"llSGL","./compare.js":"7DPt1","../supabase-client.js":"eoCsO"}],"2bucD":[function(require,module,exports,__globalThis) {
// js/dashboard/auth.js
// Handles user authentication, session management, and login UI. 
// Use the globally initialized Supabase client
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "checkAuth", ()=>checkAuth);
parcelHelpers.export(exports, "showLoginSection", ()=>showLoginSection);
parcelHelpers.export(exports, "getCurrentUser", ()=>getCurrentUser);
parcelHelpers.export(exports, "getIsAdmin", ()=>getIsAdmin);
parcelHelpers.export(exports, "getUserTier", ()=>getUserTier);
parcelHelpers.export(exports, "getIsEnterprise", ()=>getIsEnterprise);
parcelHelpers.export(exports, "getIsFree", ()=>getIsFree);
const supabase = window.supabaseClient;
// State variables
let currentUser = null;
let isAdmin = false;
let userTier = 'free';
async function checkAuth() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            currentUser = session.user;
            // Determine user tier
            userTier = currentUser.user_metadata?.tier || 'free';
            // Only treat explicit admin role as admin
            isAdmin = currentUser.user_metadata?.role === 'admin';
            console.log('User authenticated:', currentUser.email);
            console.log('User metadata:', currentUser.user_metadata);
            console.log('Tier:', userTier, 'Admin:', isAdmin);
            console.log('Role from metadata:', currentUser.user_metadata?.role);
            return true;
        } else {
            console.log('No active session');
            return false;
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        return false;
    }
}
function showLoginSection() {
    const loginSection = document.getElementById('loginSection');
    if (loginSection) {
        loginSection.style.display = 'block';
        loginSection.innerHTML = `
            <div class="login-container">
                <h2>Please Sign In</h2>
                <p>You need to be signed in to access the dashboard.</p>
                <a href="index.html" class="btn btn-primary">Go to Login</a>
            </div>
        `;
    }
}
function getCurrentUser() {
    return currentUser;
}
function getIsAdmin() {
    return isAdmin;
}
function getUserTier() {
    return userTier;
}
function getIsEnterprise() {
    return userTier === 'enterprise';
}
function getIsFree() {
    return userTier === 'free';
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"jnFvT":[function(require,module,exports,__globalThis) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, '__esModule', {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === 'default' || key === '__esModule' || Object.prototype.hasOwnProperty.call(dest, key)) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}],"9eYtm":[function(require,module,exports,__globalThis) {
// js/dashboard/assessments.js
// Handles fetching, rendering, filtering, and managing assessments. 
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getAssessments", ()=>getAssessments);
parcelHelpers.export(exports, "loadAssessments", ()=>loadAssessments);
parcelHelpers.export(exports, "viewAssessment", ()=>viewAssessment);
parcelHelpers.export(exports, "deleteAssessment", ()=>deleteAssessment);
parcelHelpers.export(exports, "filterAssessmentsLegacy", ()=>filterAssessmentsLegacy);
// New filter function that works with the BEM-based multi-select filters
parcelHelpers.export(exports, "filterAssessments", ()=>filterAssessments);
parcelHelpers.export(exports, "clearAllFiltersLegacy", ()=>clearAllFiltersLegacy);
parcelHelpers.export(exports, "clearAllFilters", ()=>clearAllFilters);
var _supabaseClientJs = require("../supabase-client.js");
var _authJs = require("./auth.js");
var _gamificationJs = require("./gamification.js");
let assessments = [];
let expandedAssessmentId = null;
function getAssessments() {
    return assessments;
}
async function loadAssessments() {
    const user = (0, _authJs.getCurrentUser)();
    const container = document.getElementById('assessment-list');
    const resultsCount = document.getElementById('resultsCount');
    if (!container) return;
    // 1. Show Loader using the correct CSS classes from results.css
    container.innerHTML = `
        <div class="loading-state-container">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading AI tool database...</p>
        </div>
    `;
    if (resultsCount) resultsCount.textContent = 'Loading assessments...';
    if (!user) {
        console.log('No user found, cannot load assessments.');
        assessments = [];
        renderAssessmentList();
        renderRecentAssessments();
        document.dispatchEvent(new Event('assessmentsUpdated'));
        return;
    }
    try {
        const query = (0, _supabaseClientJs.supabase).from('assessments').select('*').order('created_at', {
            ascending: false
        });
        if (!(0, _authJs.getIsAdmin)()) query.eq('user_id', user.id);
        const { data, error } = await query;
        if (error) {
            console.error('Supabase Query Error Details:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                user_id: user.id,
                is_admin: (0, _authJs.getIsAdmin)()
            });
            throw error;
        }
        assessments = data || [];
        console.log(`Loaded ${assessments.length} assessments`);
        renderAssessmentList();
        renderRecentAssessments();
        document.dispatchEvent(new Event('assessmentsUpdated'));
    } catch (error) {
        console.error('Error loading assessments:', error);
        assessments = [];
        // Render error state
        container.innerHTML = `
            <div class="error-state-container">
                <i data-lucide="alert-triangle" class="error-icon"></i>
                <h3 class="error-title">Failed to Load Assessments</h3>
                <p class="error-message">Could not fetch the assessment data. Please try again later.</p>
                <button onclick="loadAssessments()" class="btn btn-secondary">
                    <i data-lucide="refresh-cw" class="w-4 h-4 mr-2"></i>
                    Retry
                </button>
            </div>
        `;
        // Reinitialize Lucide icons after dynamic content creation
        if (typeof lucide !== 'undefined') setTimeout(()=>lucide.createIcons(), 100);
        if (resultsCount) resultsCount.textContent = 'Error loading assessments';
    }
}
function renderRecentAssessments() {
    const container = document.getElementById('assessmentsList');
    if (!container) return;
    const recentAssessments = assessments.slice(0, 5);
    if (recentAssessments.length === 0) {
        container.innerHTML = `
            <div class="recent-assessments-empty">
                <p>No assessments yet</p>
                <button class="btn btn-primary mt-2" onclick="window.location.href='index.html'">
                    Create your first assessment \u{2192}
                </button>
            </div>
        `;
        return;
    }
    const assessmentHTML = recentAssessments.map((assessment)=>{
        const date = new Date(assessment.created_at).toLocaleDateString();
        const formData = assessment.assessment_data?.formData || {};
        const riskColors = {
            low: 'bg-green-500',
            medium: 'bg-yellow-500',
            high: 'bg-orange-500',
            critical: 'bg-red-500' // Changed from purple to red
        };
        const riskColor = riskColors[assessment.risk_level?.toLowerCase()] || 'bg-gray-500';
        const scoreColorClass = assessment.total_score >= 80 ? 'risk-critical' : assessment.total_score >= 60 ? 'risk-high' : assessment.total_score >= 35 ? 'risk-medium' : 'risk-low'; // Aligned with AI_Risk_Framework.md Low (0-34)
        const toolVersion = assessment.license_type ? assessment.license_type.charAt(0).toUpperCase() + assessment.license_type.slice(1) : '';
        const fullToolName = toolVersion ? `${assessment.name} <span class="tool-title__license-type">${toolVersion}</span>` : assessment.name;
        return `
            <div class="dashboard-summary-assessments__item">
                <div class="dashboard-summary-assessments__content">
                    <div class="dashboard-assessment-icon">
                        <i data-lucide="bot" class="w-6 h-6 text-blue-400"></i>
                        <div class="dashboard-assessment-risk-indicator ${assessment.risk_level?.toLowerCase()}"></div>
                    </div>
                    <div class="dashboard-summary-assessments__info">
                        <div class="dashboard-summary-assessments__name">${fullToolName}</div>
                        <div class="dashboard-summary-assessments__meta">
                            <span>${date}</span>
                            <span class="dashboard-assessment-meta-divider">\u{2022}</span>
                            <span>by ${assessment.created_by || 'Anonymous'}</span>
                            <span class="dashboard-assessment-meta-divider">\u{2022}</span>
                            <span>${formData.toolCategory || assessment.category || 'General'}</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="dashboard-assessment-score">
                        <div class="score-value ${scoreColorClass}">${assessment.total_score}</div>
                        <div class="score-label">Risk Score</div>
                    </div>
                    <div class="dashboard-assessment-actions">
                        <button onclick="viewAssessment('${assessment.id}')" class="action-button" title="View Details">
                            <i data-lucide="chevron-right" class="w-5 h-5"></i>
                        </button>
                        <button class="action-button" title="Export PDF">
                            <i data-lucide="download" class="w-5 h-5"></i>
                        </button>
                        <button class="action-button" title="Share">
                            <i data-lucide="share-2" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    container.innerHTML = assessmentHTML;
    // Reinitialize Lucide icons after dynamic content creation
    if (typeof lucide !== 'undefined') setTimeout(()=>lucide.createIcons(), 100);
}
function renderAssessmentList() {
    const container = document.getElementById('assessment-list');
    const resultsCount = document.getElementById('resultsCount');
    if (!container) return;
    container.innerHTML = '';
    if (assessments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No assessments found</h3>
                <p>Start by creating your first AI tool risk assessment.</p>
                <a href="index.html" class="btn btn-primary">Create Assessment</a>
            </div>
        `;
        if (resultsCount) resultsCount.textContent = '0 assessments found';
        return;
    }
    const user = (0, _authJs.getCurrentUser)();
    const listContent = assessments.map((assessment)=>{
        const date = new Date(assessment.created_at).toLocaleDateString();
        const canDelete = (0, _authJs.getIsAdmin)() || user && assessment.user_id === user.id;
        const isExpanded = expandedAssessmentId === assessment.id;
        const formData = assessment.assessment_data?.formData || {};
        const toolVersion = assessment.license_type ? assessment.license_type.charAt(0).toUpperCase() + assessment.license_type.slice(1) : '';
        const fullToolName = toolVersion ? `${assessment.name} <span class="tool-title__license-type">${toolVersion}</span>` : assessment.name;
        return `
            <div class="assessments-page__list-item assessments-page__list-item--clickable" data-assessment-id="${assessment.id}" onclick="toggleAssessmentDetails('${assessment.id}')">
                <div class="assessments-page__col assessments-page__col--tool" data-label="Tool">
                    <button class="assessments-page__expand-btn" aria-expanded="${isExpanded}">
                        <span class="chevron${isExpanded ? ' chevron--down' : ''}"></span>
                    </button>
                    <div class="assessments-page__tool-info">
                        <h4>${fullToolName}</h4>
                        <p>${formData.toolCategory || assessment.category || 'General'}</p>
                    </div>
                </div>
                <div class="assessments-page__col assessments-page__col--score" data-label="Score">
                    <span class="assessments-page__score-badge">${assessment.total_score}/100</span>
                </div>
                <div class="assessments-page__col assessments-page__col--level" data-label="Risk Level">
                    <span class="risk-badge risk-${assessment.risk_level}">${assessment.risk_level?.toUpperCase()}</span>
                </div>
                <div class="assessments-page__col assessments-page__col--date" data-label="Date">
                    <span>${date}</span>
                </div>
                <div class="assessments-page__col assessments-page__col--actions" data-label="Actions">
                    ${canDelete ? `
                        <button class="btn-icon" title="Delete" onclick="event.stopPropagation(); deleteAssessment('${assessment.id}')">
                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="assessments-page__details-row" style="display:${isExpanded ? 'block' : 'none'}" id="details-${assessment.id}">
                <div class="assessments-page__details">
                    <div class="assessments-page__tabs">
                        <button class="assessments-page__tab assessments-page__tab--active" data-tab="details" data-assessment-id="${assessment.id}">
                            <i data-lucide="bar-chart-3"></i>
                            Risk Assessment Details
                        </button>
                        <button class="assessments-page__tab" data-tab="recommendations" data-assessment-id="${assessment.id}">
                            <i data-lucide="lightbulb"></i>
                            Recommendations
                        </button>
                        <button class="assessments-page__tab" data-tab="compliance" data-assessment-id="${assessment.id}">
                            <i data-lucide="shield-check"></i>
                            Compliance Status
                        </button>
                    </div>
                    
                    <div class="assessments-page__tab-content assessments-page__tab-content--active" data-content="details">
                        <div class="assessments-page__details-grid">
                            ${renderAssessmentDetailsContent(assessment)}
                        </div>
                    </div>
                    
                    <div class="assessments-page__tab-content" data-content="recommendations">
                        <div class="assessments-page__recommendations-list">
                            ${renderAssessmentRecommendations(assessment)}
                        </div>
                    </div>
                    
                    <div class="assessments-page__tab-content" data-content="compliance">
                        <div class="assessments-page__compliance-content">
                            ${renderAssessmentCompliance(assessment)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    container.innerHTML = listContent;
    // Add tab switching functionality
    container.querySelectorAll('.assessments-page__tab').forEach((tab)=>{
        tab.addEventListener('click', (e)=>{
            e.preventDefault();
            e.stopPropagation();
            const targetTab = tab.getAttribute('data-tab');
            const assessmentId = tab.getAttribute('data-assessment-id');
            // Find the parent details container
            const detailsContainer = tab.closest('.assessments-page__details');
            // Remove active class from all tabs and content in this assessment's details
            detailsContainer.querySelectorAll('.assessments-page__tab').forEach((t)=>t.classList.remove('assessments-page__tab--active'));
            detailsContainer.querySelectorAll('.assessments-page__tab-content').forEach((c)=>c.classList.remove('assessments-page__tab-content--active'));
            // Add active class to clicked tab and corresponding content
            tab.classList.add('assessments-page__tab--active');
            detailsContainer.querySelector(`[data-content="${targetTab}"]`).classList.add('assessments-page__tab-content--active');
        });
    });
    if (typeof lucide !== 'undefined') setTimeout(()=>lucide.createIcons(), 100);
    if (resultsCount) resultsCount.textContent = `${assessments.length} assessments found`;
}
window.toggleAssessmentDetails = function(id) {
    expandedAssessmentId = expandedAssessmentId === id ? null : id;
    renderAssessmentList();
};
function renderAssessmentDetailsContent(assessment) {
    const data = assessment.assessment_data || {};
    // Handle both camelCase and snake_case for detailed assessment object
    const detailedAssessment = data.detailedAssessment || data.detailed_assessment || data.results?.detailed_assessment || {};
    // Extract data exactly like compare.js does
    const detailsHTML = Object.entries(detailedAssessment.assessment_details || {}).map(([key, detail])=>{
        const categoryScore = detail.category_score || 0;
        return `
            <div class="assessments-page__detail-card">
                <h5 class="assessments-page__detail-title">${key.replace(/_/g, ' ').replace(/\b\w/g, (char)=>char.toUpperCase())}</h5>
                <div class="assessments-page__detail-score">Score: ${categoryScore}</div>
                <div class="assessments-page__detail-content">
                    ${Object.entries(detail.criteria || {}).map(([critKey, crit])=>`
                        <div class="assessments-page__detail-item">
                            <strong>${critKey.replace(/_/g, ' ').replace(/\b\w/g, (char)=>char.toUpperCase())}:</strong> ${crit.score} - ${crit.justification}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('') || '<p>No detailed assessment available</p>';
    return detailsHTML;
}
function renderAssessmentRecommendations(assessment) {
    const data = assessment.assessment_data || {};
    // Access recommendations from multiple possible paths like compare.js does
    const recommendations = data.recommendations || assessment.recommendations || data.results?.recommendations || [];
    const recs = recommendations.map((r)=>`
        <div class="assessments-page__recommendation">
            <div class="assessments-page__rec-bullet assessments-page__rec-priority--${r.priority}"></div>
            <div>
                <h5 class="assessments-page__rec-title">${r.title}</h5>
                <p class="assessments-page__rec-desc">${r.description}</p>
                <span class="assessments-page__rec-meta">Priority: ${r.priority} | Category: ${r.category}</span>
            </div>
        </div>
    `).join('') || '<p>No recommendations available</p>';
    return recs;
}
function renderAssessmentCompliance(assessment) {
    try {
        console.log('Rendering Compliance for Assessment:', assessment);
        const data = assessment.assessment_data || {};
        const formData = data.formData || {};
        const detailedAssessment = data.detailed_assessment || data.results?.detailed_assessment || {};
        // Access compliance data from multiple possible paths
        const complianceData = assessment.compliance || data.compliance || {}; // Keep for fallback/other uses if needed
        const complianceCertificationsObject = assessment.compliance_certifications || data.compliance_certifications || {};
        console.log('Compliance Data:', {
            complianceData,
            complianceCertificationsObject,
            assessmentData: data
        });
        let certificationsHtml = '';
        if (complianceCertificationsObject && typeof complianceCertificationsObject === 'object') {
            const certEntries = Object.entries(complianceCertificationsObject);
            if (certEntries.length > 0) certificationsHtml = certEntries.map(([certName, certDetails])=>{
                const status = certDetails.status || 'N/A';
                const details = certDetails.details || 'No details provided.';
                const evidence = certDetails.evidence || 'No evidence provided.';
                const limitations = certDetails.limitations || 'None';
                const lastVerified = certDetails.last_verified || 'N/A';
                let statusIcon = '';
                let statusClass = '';
                switch(status.toLowerCase()){
                    case 'compliant':
                    case 'type ii':
                        statusIcon = '<i data-lucide="check-circle" class="assessments-page__compliance-icon assessments-page__compliance-icon--compliant"></i>';
                        statusClass = '--compliant';
                        break;
                    case 'conditionally compliant':
                        statusIcon = '<i data-lucide="alert-triangle" class="assessments-page__compliance-icon assessments-page__compliance-icon--conditional"></i>';
                        statusClass = '--conditional';
                        break;
                    case 'no':
                        statusIcon = '<i data-lucide="x-circle" class="assessments-page__compliance-icon assessments-page__compliance-icon--noncompliant"></i>';
                        statusClass = '--noncompliant';
                        break;
                    case 'not applicable':
                        statusIcon = '<i data-lucide="info" class="assessments-page__compliance-icon assessments-page__compliance-icon--na"></i>';
                        statusClass = '--na';
                        break;
                    default:
                        statusIcon = '<i data-lucide="help-circle" class="assessments-page__compliance-icon"></i>';
                        break;
                }
                return `
                        <div class="assessments-page__compliance-card">
                            <div class="assessments-page__compliance-card-header">
                                ${statusIcon}
                                <h5 class="assessments-page__compliance-card-title">${certName.toUpperCase()}</h5>
                                <span class="assessments-page__compliance-card-status assessments-page__compliance-card-status${statusClass}">${status}</span>
                            </div>
                            <div class="assessments-page__compliance-card-body">
                                <p><strong>Details:</strong> ${details}</p>
                                <p><strong>Evidence:</strong> ${evidence}</p>
                                <p><strong>Limitations:</strong> ${limitations}</p>
                                <p><strong>Last Verified:</strong> ${lastVerified}</p>
                            </div>
                        </div>
                    `;
            }).join('');
        }
        // Fallback if no detailed certifications object
        if (!certificationsHtml) certificationsHtml = '<p>No detailed compliance data available.</p>';
        // Explicitly get compliance_summary from the correct nested path
        const complianceSummary = assessment.assessment_data?.detailedAssessment?.compliance_summary || 'No compliance summary available';
        return `
            <div class="assessments-page__compliance-grid">
                ${certificationsHtml}
            </div>
            <div class="assessments-page__compliance-summary">
                <p><strong>Documentation Tier:</strong> ${assessment.documentation_tier || 'Not specified'}</p>
                <p><strong>Use Case:</strong> ${formData.useCase || assessment.primary_use_case || 'Not specified'}</p>
                <p><strong>Summary:</strong> ${complianceSummary}</p>
            </div>
        `;
    } catch (error) {
        console.error('Error in renderAssessmentCompliance:', error);
        return `
            <div class="assessments-page__compliance-error">
                <p>Error rendering compliance information</p>
                <pre>${JSON.stringify(error, null, 2)}</pre>
            </div>
        `;
    }
}
function renderAssessmentDetails(assessment) {
    const data = assessment.assessment_data || {};
    const detailedAssessment = data.detailed_assessment || data.results?.detailed_assessment || {};
    const recommendations = data.recommendations || data.results?.recommendations || [];
    const formData = data.formData || {};
    const renderCategory = (category)=>{
        const title = category.category || 'Unknown Category';
        const score = category.score;
        const metrics = category.metrics || [];
        return `
            <div class="assessment-details__category">
                <div class="assessment-details__category-header">
                    <h4 class="assessment-details__category-title">${title}</h4>
                    <span class="assessment-details__category-score score--${getRiskLevelClass(score)}">${score}/100</span>
                </div>
                <div class="assessment-details__metrics-grid">
                    ${metrics.map((metric)=>`
                        <div class="assessment-details__metric">
                            <div class="assessment-details__metric-name">${metric.name}</div>
                            <div class="assessment-details__metric-value">${metric.value}</div>
                            <div class="assessment-details__metric-note">${metric.note}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    };
    return `
        <div class="assessment-details__container">
            <div class="assessment-details__sidebar">
                <div class="assessment-details__meta">
                    <h3 class="assessment-details__meta-title">Assessment Info</h3>
                    <div class="assessment-details__meta-item">
                        <i data-lucide="tag" class="assessment-details__meta-icon"></i>
                        <span><strong>Tool Version:</strong> ${formData.toolVersion || 'N/A'}</span>
                    </div>
                    <div class="assessment-details__meta-item">
                        <i data-lucide="layout-grid" class="assessment-details__meta-icon"></i>
                        <span><strong>Category:</strong> ${formData.toolCategory || 'N/A'}</span>
                    </div>
                    <div class="assessment-details__meta-item">
                        <i data-lucide="briefcase" class="assessment-details__meta-icon"></i>
                        <span><strong>Use Case:</strong> ${formData.useCase || 'N/A'}</span>
                    </div>
                    <div class="assessment-details__meta-item">
                        <i data-lucide="shield" class="assessment-details__meta-icon"></i>
                        <span><strong>Data Classification:</strong> ${formData.dataClassification || 'N/A'}</span>
                    </div>
                </div>
                 <a href="assessment-detail.html?id=${assessment.id}" class="btn btn-primary assessment-details__full-report-btn">
                    View Full Report
                    <i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>
                </a>
            </div>
            <div class="assessment-details__main">
                <div class="assessment-details__tabs">
                    <button class="assessment-details__tab active" data-tab="breakdown">Detailed Breakdown</button>
                    <button class="assessment-details__tab" data-tab="recommendations">Recommendations</button>
                </div>
                <div class="assessment-details__tab-content active" id="tab-breakdown">
                    ${(detailedAssessment.categories || []).map(renderCategory).join('')}
                </div>
                <div class="assessment-details__tab-content" id="tab-recommendations">
                    <ul class="assessment-details__recommendations-list">
                        ${recommendations.map((rec)=>`
                            <li class="assessment-details__recommendation-item">
                                <i data-lucide="check-circle" class="assessment-details__rec-icon"></i>
                                <div>
                                    <h5 class="assessment-details__rec-title">${rec.title}</h5>
                                    <p class="assessment-details__rec-desc">${rec.description}</p>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
}
function viewAssessment(id) {
    window.location.href = `assessment-detail.html?id=${id}`;
}
async function deleteAssessment(id) {
    const user = (0, _authJs.getCurrentUser)();
    if (!user) {
        alert('You must be logged in to delete assessments.');
        return;
    }
    // Find the assessment to check ownership
    const assessment = assessments.find((a)=>a.id === id);
    if (!assessment) {
        alert('Assessment not found.');
        return;
    }
    // Allow if admin or owner
    if (!(0, _authJs.getIsAdmin)() && assessment.user_id !== user.id) {
        alert('Access denied. You can only delete your own assessments.');
        return;
    }
    if (!confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) return;
    try {
        const { error } = await (0, _supabaseClientJs.supabase).from('assessments').delete().eq('id', id);
        if (error) throw error;
        loadAssessments();
    // Optionally, show a success message
    // showToast('Assessment deleted successfully.');
    } catch (error) {
        console.error('Error deleting assessment:', error);
    // showToast('Error deleting assessment.', 'error');
    }
}
function filterAssessmentsLegacy() {
    // Legacy filter function - kept for backward compatibility
    // This uses old element IDs like searchInput, riskFilter, categoryFilter
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const riskFilter = document.getElementById('riskFilter')?.value || 'all';
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
    const sortBy = document.getElementById('sortSelect')?.value || 'date_desc';
    let filteredAssessments = [
        ...assessments
    ];
    if (searchTerm) filteredAssessments = filteredAssessments.filter((a)=>a.name.toLowerCase().includes(searchTerm));
    if (riskFilter !== 'all') filteredAssessments = filteredAssessments.filter((a)=>a.risk_level === riskFilter);
    if (categoryFilter !== 'all') filteredAssessments = filteredAssessments.filter((a)=>a.category === categoryFilter);
    filteredAssessments.sort((a, b)=>{
        switch(sortBy){
            case 'date_asc':
                return new Date(a.created_at) - new Date(b.created_at);
            case 'date_desc':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'score_asc':
                return (a.total_score || 0) - (b.total_score || 0);
            case 'score_desc':
                return (b.total_score || 0) - (a.total_score || 0);
            case 'name_asc':
                return a.name.localeCompare(b.name);
            case 'name_desc':
                return b.name.localeCompare(a.name);
            default:
                return 0;
        }
    });
    renderFilteredAssessments(filteredAssessments);
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) resultsCount.textContent = `${filteredAssessments.length} assessments found`;
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        const hasFilters = searchTerm || riskFilter !== 'all' || categoryFilter !== 'all' || sortBy !== 'date_desc';
        clearFiltersBtn.style.display = hasFilters ? 'inline-block' : 'none';
    }
}
function filterAssessments(filters = {}) {
    const { searchTerm = '', riskLevels = [], categories = [], dateRanges = [], sortBy = 'date_desc' } = filters;
    let filteredAssessments = [
        ...assessments
    ];
    // Apply search filter
    if (searchTerm) filteredAssessments = filteredAssessments.filter((a)=>a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.category && a.category.toLowerCase().includes(searchTerm.toLowerCase()));
    // Apply risk level filter
    if (riskLevels.length > 0) filteredAssessments = filteredAssessments.filter((a)=>riskLevels.includes(a.risk_level));
    // Apply category filter
    if (categories.length > 0) filteredAssessments = filteredAssessments.filter((a)=>{
        const category = a.category?.toLowerCase() || '';
        return categories.some((cat)=>{
            switch(cat){
                case 'conversational':
                    return category.includes('conversational') || category.includes('chat');
                case 'image':
                    return category.includes('image') || category.includes('visual');
                case 'code':
                    return category.includes('code') || category.includes('development');
                case 'data':
                    return category.includes('data') || category.includes('analysis');
                default:
                    return category.includes(cat);
            }
        });
    });
    // Apply date range filter
    if (dateRanges.length > 0) {
        const now = new Date();
        filteredAssessments = filteredAssessments.filter((a)=>{
            const assessmentDate = new Date(a.created_at);
            return dateRanges.some((range)=>{
                switch(range){
                    case 'today':
                        return assessmentDate.toDateString() === now.toDateString();
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 604800000);
                        return assessmentDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 2592000000);
                        return assessmentDate >= monthAgo;
                    case 'year':
                        const yearAgo = new Date(now.getTime() - 31536000000);
                        return assessmentDate >= yearAgo;
                    default:
                        return true;
                }
            });
        });
    }
    // Apply sorting
    filteredAssessments.sort((a, b)=>{
        switch(sortBy){
            case 'newest':
            case 'date_desc':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'oldest':
            case 'date_asc':
                return new Date(a.created_at) - new Date(b.created_at);
            case 'risk-high':
            case 'score_desc':
                return (b.total_score || 0) - (a.total_score || 0);
            case 'risk-low':
            case 'score_asc':
                return (a.total_score || 0) - (b.total_score || 0);
            case 'name-az':
            case 'name_asc':
                return a.name.localeCompare(b.name);
            case 'name-za':
            case 'name_desc':
                return b.name.localeCompare(a.name);
            default:
                return new Date(b.created_at) - new Date(a.created_at);
        }
    });
    renderFilteredAssessments(filteredAssessments);
    return filteredAssessments;
}
function clearAllFiltersLegacy() {
    // Legacy clear function - kept for backward compatibility
    const searchInput = document.getElementById('searchInput');
    const riskFilter = document.getElementById('riskFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortSelect = document.getElementById('sortSelect');
    if (searchInput) searchInput.value = '';
    if (riskFilter) riskFilter.value = 'all';
    if (categoryFilter) categoryFilter.value = 'all';
    if (sortSelect) sortSelect.value = 'date_desc';
    filterAssessmentsLegacy();
}
const clearAllFilters = clearAllFiltersLegacy;
function renderAssessmentItem(assessment) {
    const riskLevelClass = getRiskLevelClass(assessment.total_score);
    const riskLevelText = getRiskLevelText(assessment.total_score);
    const toolVersion = assessment.license_type ? assessment.license_type.charAt(0).toUpperCase() + assessment.license_type.slice(1) : '';
    const fullToolName = toolVersion ? `${assessment.name} <span class="tool-title__license-type">${toolVersion}</span>` : assessment.name;
    return `
        <div class="dashboard-summary-assessments__item">
            <div class="dashboard-summary-assessments__item-content">
                <div class="dashboard-summary-assessments__item-icon">
                    <i data-lucide="${getToolIcon(assessment.category)}" class="w-5 h-5"></i>
                </div>
                <div class="dashboard-summary-assessments__item-info">
                    <h3 class="dashboard-summary-assessments__item-name">${fullToolName}</h3>
                    <p class="dashboard-summary-assessments__item-category">${assessment.category || 'General'}</p>
                </div>
            </div>
            <div class="dashboard-summary-assessments__item-meta">
                <span class="dashboard-summary-assessments__item-risk risk-${riskLevelClass.toLowerCase()}">${riskLevelText}</span>
                <span class="dashboard-summary-assessments__item-score">${assessment.total_score}/100</span>
                <span class="dashboard-summary-assessments__item-date">${formatDate(assessment.created_at)}</span>
                <button class="dashboard-summary-assessments__item-action" onclick="viewAssessment('${assessment.id}')" aria-label="View Details">
                    <i data-lucide="eye" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `;
}
function getToolIcon(category) {
    const icons = {
        'Content Generation': 'pen-tool',
        'Code Analysis': 'code',
        'Development': 'laptop',
        'Image Generation': 'image',
        'Productivity': 'check-square',
        'default': 'bot'
    };
    return icons[category] || icons.default;
}
function getRiskLevelClass(score) {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
}
function getRiskLevelText(score) {
    if (score >= 80) return 'Low Risk';
    if (score >= 60) return 'Medium Risk';
    if (score >= 40) return 'High Risk';
    return 'Critical Risk';
}
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}
// Update the assessment list
function updateAssessmentsList(assessments) {
    const container = document.getElementById('assessmentsList');
    if (!container) return;
    // Sort by date descending and take the 5 most recent
    const recentAssessments = assessments.sort((a, b)=>new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
    container.innerHTML = recentAssessments.map((assessment)=>renderAssessmentItem(assessment)).join('');
}
function renderFilteredAssessments(filteredData) {
    const container = document.getElementById('assessment-list') || document.querySelector('.assessment-grid');
    const resultsCount = document.getElementById('resultsCount') || document.querySelector('.dashboard-controls__results-count');
    if (!container) return;
    container.innerHTML = '';
    if (filteredData.length === 0) container.innerHTML = `
            <div class="empty-state">
                <h3>No matching assessments found</h3>
                <p>Try adjusting your filters or search terms.</p>
                <button onclick="clearAllFiltersLegacy()" class="btn btn-secondary">Clear Filters</button>
            </div>
        `;
    else {
        const user = (0, _authJs.getCurrentUser) && (0, _authJs.getCurrentUser)();
        const listContent = filteredData.map((assessment)=>{
            const date = new Date(assessment.created_at).toLocaleDateString();
            const canDelete = typeof (0, _authJs.getIsAdmin) === 'function' && (0, _authJs.getIsAdmin)() || user && assessment.user_id === user.id;
            const isExpanded = typeof expandedAssessmentId !== 'undefined' && expandedAssessmentId === assessment.id;
            const formData = assessment.assessment_data?.formData || {};
            const toolVersion = assessment.license_type ? assessment.license_type.charAt(0).toUpperCase() + assessment.license_type.slice(1) : '';
            const fullToolName = toolVersion ? `${assessment.name} <span class="tool-title__license-type">${toolVersion}</span>` : assessment.name;
            // Check if we're rendering for the new dashboard grid or old list
            if (container.classList.contains('assessment-grid')) // New dashboard grid format
            return `
                    <div class="assessment-item" data-risk="${assessment.risk_level}" data-category="${(assessment.category || '').toLowerCase()}" data-assessment-id="${assessment.id}">
                        <div class="assessment-item__header">
                            <h3 class="assessment-item__title">${assessment.name}</h3>
                            <span class="assessment-item__risk risk-${assessment.risk_level}">${assessment.risk_level?.toUpperCase()}</span>
                        </div>
                        <div class="assessment-item__content">
                            <p class="assessment-item__description">${formData.toolDescription || assessment.description || 'AI risk assessment tool.'}</p>
                            <div class="assessment-item__meta">
                                <span class="assessment-item__date">${date}</span>
                                <span class="assessment-item__category">${formData.toolCategory || assessment.category || 'General'}</span>
                            </div>
                        </div>
                        <div class="assessment-item__actions">
                            <button class="btn btn-sm" onclick="viewAssessment('${assessment.id}')">View Details</button>
                            <button class="btn btn-sm btn-outline">Export</button>
                        </div>
                    </div>
                `;
            else // Legacy list format
            return `
                    <div class="assessments-page__list-item" data-assessment-id="${assessment.id}">
                        <div class="assessments-page__col assessments-page__col--tool" data-label="Tool">
                            <div class="assessments-page__tool-info">
                                <h4>${fullToolName}</h4>
                                <p>${formData.toolCategory || assessment.category || 'General'}</p>
                            </div>
                        </div>
                        <div class="assessments-page__col assessments-page__col--score" data-label="Score">
                            <span class="assessments-page__score-badge">${assessment.total_score}/100</span>
                        </div>
                        <div class="assessments-page__col assessments-page__col--level" data-label="Risk Level">
                            <span class="risk-badge risk-${assessment.risk_level}">${assessment.risk_level?.toUpperCase()}</span>
                        </div>
                        <div class="assessments-page__col assessments-page__col--date" data-label="Date">
                            <span>${date}</span>
                        </div>
                        <div class="assessments-page__col assessments-page__col--actions" data-label="Actions">
                            <button class="btn-icon" title="View Details" aria-expanded="${isExpanded}" aria-controls="details-${assessment.id}" onclick="toggleAssessmentDetails('${assessment.id}')">
                                <i data-lucide="eye" class="w-5 h-5"></i>
                            </button>
                            ${canDelete ? `
                                <button class="btn-icon" title="Delete" onclick="deleteAssessment('${assessment.id}')">
                                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    <div class="assessments-page__details${isExpanded ? ' assessments-page__details--expanded' : ''}" id="details-${assessment.id}" style="display:${isExpanded ? 'block' : 'none'}" role="region" aria-hidden="${!isExpanded}">
                        ${isExpanded ? renderAssessmentDetails(assessment) : ''}
                    </div>
                `;
        }).join('');
        container.innerHTML = listContent;
        if (typeof lucide !== 'undefined') setTimeout(()=>lucide.createIcons(), 100);
    }
    if (resultsCount) resultsCount.textContent = `${filteredData.length} of ${assessments.length} assessments shown`;
// Re-initialize any dynamic components like tooltips if needed
}
// Initialize event listeners
document.addEventListener('DOMContentLoaded', ()=>{
    // Search button handler
    const searchButton = document.getElementById('searchButton');
    if (searchButton) searchButton.addEventListener('click', ()=>{
    // Implement search functionality
    });
    // Filter button handler
    const filterButton = document.getElementById('filterButton');
    if (filterButton) filterButton.addEventListener('click', ()=>{
    // Implement filter functionality
    });
});

},{"../supabase-client.js":"eoCsO","./auth.js":"2bucD","./gamification.js":"lUSAA","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"eoCsO":[function(require,module,exports,__globalThis) {
// docs/js/supabase-client.js
// This file provides a consistent way to access the Supabase client across the application
// Constants for Supabase connection
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "supabase", ()=>supabase);
const SUPABASE_URL = 'https://lgybmsziqjdmmxdiyils.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneWJtc3ppcWpkbW14ZGl5aWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTAzOTcsImV4cCI6MjA2NjI4NjM5N30.GFqiwK2qi3TnlUDCmdFZpG69pqdPP-jpbxdUGX6VlSg';
// Initialize Supabase client
let supabaseClient;
// Try to use the global client if available
if (typeof window !== 'undefined' && window.supabaseClient) {
    supabaseClient = window.supabaseClient;
    console.log('Using globally initialized Supabase client');
} else if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Created new Supabase client');
    // Make it globally available
    window.supabaseClient = supabaseClient;
} else if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Created new Supabase client in module context');
} else {
    console.error('Supabase client could not be initialized. Make sure the Supabase library is loaded.');
    // Create a dummy client to prevent errors
    supabaseClient = {
        auth: {
            onAuthStateChange: ()=>{},
            getSession: async ()=>({
                    data: {
                        session: null
                    }
                }),
            signInWithPassword: async ()=>({
                    error: new Error('Supabase not initialized')
                }),
            signUp: async ()=>({
                    error: new Error('Supabase not initialized')
                }),
            signOut: async ()=>({
                    error: new Error('Supabase not initialized')
                })
        }
    };
}
const supabase = supabaseClient;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"lUSAA":[function(require,module,exports,__globalThis) {
// js/dashboard/gamification.js
// Handles all gamification features, such as achievements,
// progress tracking, and rewards. 
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "updateDashboardStats", ()=>updateDashboardStats);
parcelHelpers.export(exports, "updateProgressTracking", ()=>updateProgressTracking) /*
export function loadAchievements() {
    const totalCount = getAssessments().length;
    const achievements = [
        {
            id: 'first-assessment',
            name: 'First Steps',
            description: 'Complete your first risk assessment',
            icon: '🎯',
            unlocked: totalCount >= 1,
            progress: Math.min(totalCount, 1),
            requirement: 1
        },
        {
            id: 'power-user',
            name: 'Power User',
            description: 'Complete 25 risk assessments',
            icon: '⚡',
            unlocked: totalCount >= 25,
            progress: Math.min(totalCount, 25),
            requirement: 25
        },
        {
            id: 'risk-expert',
            name: 'Risk Expert',
            description: 'Complete 50 risk assessments',
            icon: '🔍',
            unlocked: totalCount >= 50,
            progress: Math.min(totalCount, 50),
            requirement: 50
        }
    ];
    
    renderAchievements(achievements);
}

function renderAchievements(achievements) {
    const container = document.getElementById('achievementsList');
    if (!container) return;
    
    container.innerHTML = achievements.map(achievement => {
        const progressPercent = (achievement.progress / achievement.requirement) * 100;
        const statusClass = achievement.unlocked ? 'unlocked' : 'in-progress';
        
        return `
            <div class="achievement-card ${statusClass}">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                        <span class="text-lg">${achievement.icon}</span>
                        <h4 class="font-medium">${achievement.name}</h4>
                    </div>
                    ${achievement.unlocked ? '<span class="text-xs text-green-400">✓ Unlocked</span>' : ''}
                </div>
                <p class="text-sm text-gray-400 mb-2">${achievement.description}</p>
                ${!achievement.unlocked ? `
                    <div class="achievement-progress-bar">
                        <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <span class="text-xs text-gray-400">${achievement.progress}/${achievement.requirement}</span>
                ` : ''}
            </div>
        `;
    }).join('');
}
*/ ;
var _assessmentsJs = require("./assessments.js");
function updateDashboardStats() {
    const assessments = (0, _assessmentsJs.getAssessments)();
    const totalCount = assessments.length;
    const highRiskCount = assessments.filter((a)=>a.risk_level === 'high' || a.risk_level === 'critical').length;
    const lowRiskCount = assessments.filter((a)=>a.risk_level === 'low').length;
    const avgScore = totalCount > 0 ? Math.round(assessments.reduce((sum, a)=>sum + (a.total_score || 0), 0) / totalCount) : 0;
    // Update stat cards
    const totalEl = document.getElementById('totalAssessments');
    const highEl = document.getElementById('highRiskCount');
    const lowEl = document.getElementById('lowRiskCount');
    const avgEl = document.getElementById('avgScore');
    const badgeEl = document.getElementById('assessmentBadge');
    const remainingEl = document.getElementById('remainingText');
    if (totalEl) totalEl.textContent = totalCount;
    if (highEl) highEl.textContent = highRiskCount;
    if (lowEl) lowEl.textContent = lowRiskCount;
    if (avgEl) avgEl.textContent = avgScore;
    if (badgeEl) badgeEl.textContent = totalCount;
    // Update remaining text
    const remaining = Math.max(0, 25 - totalCount);
    if (remainingEl) remainingEl.textContent = `${remaining} remaining in free tier`;
}
function updateProgressTracking() {
    const totalCount = (0, _assessmentsJs.getAssessments)().length;
    const limit = 25; // Free tier limit
    const percentage = Math.min(totalCount / limit * 100, 100);
    // Update progress bar
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('assessmentProgress');
    const remainingText = document.getElementById('remainingCount');
    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${totalCount}/${limit}`;
    if (remainingText) remainingText.textContent = `${Math.max(0, limit - totalCount)} assessments remaining`;
}

},{"./assessments.js":"9eYtm","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"8JRbO":[function(require,module,exports,__globalThis) {
// js/dashboard/import.js
// Manages the file import functionality, including drag-and-drop
// and processing uploaded files.
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initImport", ()=>initImport);
parcelHelpers.export(exports, "handleFileSelect", ()=>handleFileSelect);
parcelHelpers.export(exports, "processImport", ()=>processImport);
var _authJs = require("./auth.js");
var _assessmentsJs = require("./assessments.js");
var _gamificationJs = require("./gamification.js");
var _uiJs = require("./ui.js");
let supabaseClient = null;
const SUPABASE_URL = "https://lgybmsziqjdmmxdiyils.supabase.co";
function initImport(client) {
    supabaseClient = client;
}
function handleFileSelect(event) {
    const files = event.target.files;
    const fileListContainer = document.getElementById('file-upload-list');
    const importOptions = document.getElementById('importOptions');
    if (!files.length) return;
    fileListContainer.innerHTML = ''; // Clear previous list
    Array.from(files).forEach((file)=>{
        const fileItem = document.createElement('div');
        fileItem.className = 'admin-upload-tool__file-list-item';
        fileItem.innerHTML = `
          <div class="admin-upload-tool__file-list-item-content flex items-center space-x-2">
            <i data-lucide="file-text" class="w-5 h-5 text-gray-400"></i>
            <span class="text-sm">${file.name}</span>
          </div>
          <span class="text-xs text-gray-500">${(file.size / 1024).toFixed(1)} KB</span>
        `;
        fileListContainer.appendChild(fileItem);
    });
    // Show import options
    if (importOptions) importOptions.style.display = 'block';
}
async function processImport() {
    if (!(0, _authJs.getIsAdmin)()) {
        alert('Access denied. Admin privileges required.');
        return;
    }
    const fileInput = document.getElementById('fileInput');
    const importError = document.getElementById('importError');
    const importOptions = document.getElementById('importOptions');
    if (!fileInput.files.length) {
        showError('Please select a file to upload.');
        return;
    }
    try {
        // Hide error and show loading
        if (importError) importError.style.display = 'none';
        if (importOptions) importOptions.style.display = 'none';
        const file = fileInput.files[0];
        // Validate file is JSON
        const text = await file.text();
        let assessmentData;
        try {
            assessmentData = JSON.parse(text);
        } catch (e) {
            showError('Invalid JSON file.');
            return;
        }
        // Debug: Log the parsed data to see what we're working with
        console.log('Parsed assessment data:', assessmentData);
        console.log('compliance_certifications field:', assessmentData.compliance_certifications);
        console.log('compliance_certifications type:', typeof assessmentData.compliance_certifications);
        console.log('Is array?', Array.isArray(assessmentData.compliance_certifications));
        // Validate only the essential required fields
        const requiredFields = [
            'name',
            'total_score',
            'risk_level'
        ];
        const missingFields = requiredFields.filter((field)=>!assessmentData[field]);
        if (missingFields.length > 0) {
            console.log('Missing fields:', missingFields);
            showError(`Invalid assessment file format. Missing required fields: ${missingFields.join(', ')}`);
            return;
        }
        // Validate score fields exist (can be 0)
        const scoreFields = [
            'data_storage_score',
            'training_usage_score',
            'access_controls_score',
            'compliance_score',
            'vendor_transparency_score'
        ];
        const missingScores = scoreFields.filter((field)=>assessmentData[field] === undefined || assessmentData[field] === null);
        if (missingScores.length > 0) {
            showError(`Invalid assessment file format. Missing score fields: ${missingScores.join(', ')}`);
            return;
        }
        // Validate detailed_assessment structure (optional but recommended)
        if (assessmentData.detailed_assessment && typeof assessmentData.detailed_assessment !== 'object') {
            showError('Invalid assessment file format. detailed_assessment must be an object if present.');
            return;
        }
        // Prepare multipart/form-data
        const formData = new FormData();
        formData.append('file', file);
        // Get Supabase access token
        const { data: sessionData } = await supabaseClient.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) {
            showError('Authentication error: No access token found. Please log in again.');
            return;
        }
        // Upload to Supabase Edge Function with Authorization header
        const response = await fetch('https://lgybmsziqjdmmxdiyils.functions.supabase.co/upload-assessment', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });
        const result = await response.json();
        if (!response.ok) {
            showError(result.error || 'Upload failed');
            return;
        }
        alert('Assessment uploaded successfully!');
        // Clear the form
        fileInput.value = '';
        document.getElementById('file-upload-list').innerHTML = '';
        // Refresh the assessments list
        await (0, _assessmentsJs.loadAssessments)();
        (0, _gamificationJs.updateDashboardStats)();
        (0, _gamificationJs.updateProgressTracking)();
    } catch (error) {
        showError(`Upload failed: ${error.message}`);
    }
}
function showError(message) {
    const importError = document.getElementById('importError');
    if (importError) {
        importError.textContent = message;
        importError.style.display = 'block';
    }
}

},{"./auth.js":"2bucD","./assessments.js":"9eYtm","./gamification.js":"lUSAA","./ui.js":"lhVUw","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"lhVUw":[function(require,module,exports,__globalThis) {
// js/dashboard/ui.js
// Manages general UI interactions, such as tab switching,
// notifications, and dynamic component updates. 
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "updateTierBadge", ()=>updateTierBadge);
parcelHelpers.export(exports, "switchTab", ()=>switchTab);
parcelHelpers.export(exports, "setupEventListeners", ()=>setupEventListeners);
parcelHelpers.export(exports, "closeBanner", ()=>closeBanner);
var _authJs = require("./auth.js");
var _assessmentsJs = require("./assessments.js");
var _importJs = require("./import.js");
let currentTab = 'dashboard';
function updateTierBadge() {
    const tierBadge = document.getElementById('tierBadge');
    if (tierBadge) {
        const user = (0, _authJs.getCurrentUser)();
        const tier = user?.user_metadata?.tier || 'free';
        tierBadge.textContent = tier.toUpperCase();
        tierBadge.className = `text-xs px-2 py-0.5 rounded-full ${tier === 'pro' ? 'bg-purple-600' : 'bg-green-600'}`;
    }
}
function switchTab(tabName) {
    currentTab = tabName;
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach((content)=>{
        content.classList.remove('active');
    });
    // Update nav button styles
    document.querySelectorAll('.dashboard-nav').forEach((btn)=>{
        btn.classList.remove('active');
    });
    // Show the selected tab content
    const activeContent = document.getElementById(`${tabName}-content`);
    if (activeContent) activeContent.classList.add('active');
    // Highlight the selected nav button
    const activeBtn = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    if (activeBtn) activeBtn.classList.add('active');
    if (!activeContent && tabName !== 'dashboard') switchTab('dashboard');
}
function setupEventListeners() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    if (dropzone) {
        dropzone.addEventListener('click', ()=>fileInput.click());
        dropzone.addEventListener('dragover', (e)=>{
            e.preventDefault();
            dropzone.classList.add('active');
        });
        dropzone.addEventListener('dragleave', ()=>{
            dropzone.classList.remove('active');
        });
        dropzone.addEventListener('drop', (e)=>{
            e.preventDefault();
            dropzone.classList.remove('active');
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                (0, _importJs.handleFileSelect)({
                    target: fileInput
                });
            }
        });
    }
    if (fileInput) fileInput.addEventListener('change', (0, _importJs.handleFileSelect));
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', (0, _assessmentsJs.filterAssessmentsLegacy));
    const riskFilter = document.getElementById('riskFilter');
    if (riskFilter) riskFilter.addEventListener('change', (0, _assessmentsJs.filterAssessmentsLegacy));
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) categoryFilter.addEventListener('change', (0, _assessmentsJs.filterAssessmentsLegacy));
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.addEventListener('change', (0, _assessmentsJs.filterAssessmentsLegacy));
}
function closeBanner() {
    const banner = document.getElementById('promoBanner');
    if (banner) banner.style.display = 'none';
}

},{"./auth.js":"2bucD","./assessments.js":"9eYtm","./import.js":"8JRbO","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"fPGsB":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// Achievement data management and rendering
parcelHelpers.export(exports, "AchievementsManager", ()=>AchievementsManager);
var _assessmentsJs = require("./assessments.js");
class AchievementsManager {
    constructor(containerSelector = '.dashboard-achievements'){
        this.container = document.querySelector(containerSelector);
        this.achievementsData = this.getAchievementDefinitions();
        this.assessmentsCount = 0;
    }
    initialize() {
        if (!this.container) {
            console.warn('Achievements container not found.');
            return;
        }
        // Initial update
        this.updateProgress();
        // Listen for assessment changes
        document.addEventListener('assessmentsUpdated', ()=>{
            this.updateProgress();
        });
    }
    getAchievementDefinitions() {
        return [
            {
                id: 'rookie',
                name: 'Risk Assessment Rookie',
                description: 'Complete your first assessment',
                icon: 'check-circle',
                requiredCount: 1
            },
            {
                id: 'detective',
                name: 'Risk Detective',
                description: 'Complete 10 assessments',
                icon: 'search',
                requiredCount: 10
            },
            {
                id: 'power_user',
                name: 'Power User',
                description: 'Complete 25 assessments',
                icon: 'zap',
                requiredCount: 25
            },
            {
                id: 'risk_master',
                name: 'Risk Master',
                description: 'Complete 50 assessments',
                icon: 'shield',
                requiredCount: 50
            }
        ];
    }
    calculateProgress(achievement) {
        const current = this.assessmentsCount;
        const required = achievement.requiredCount;
        const isUnlocked = current >= required;
        const percentage = Math.min(100, current / required * 100);
        return {
            isUnlocked,
            percentage,
            current,
            required
        };
    }
    renderAchievementCard(achievement) {
        const progress = this.calculateProgress(achievement);
        const isUnlocked = progress.isUnlocked;
        const percentage = progress.percentage;
        let status = '';
        if (isUnlocked) status = 'unlocked';
        else if (percentage > 0) status = 'in-progress';
        else status = 'locked';
        // Icon color class
        const iconClass = `achievement-icon ${status}`;
        const nameClass = `achievement-name ${status}`;
        return `
            <div class="achievement-card ${status}">
                <div class="achievement-content">
                    <div class="achievement-header">
                        <i data-lucide="${achievement.icon}" class="${iconClass}"></i>
                        <span class="${nameClass}">${achievement.name}</span>
                    </div>
                    <p class="achievement-description">${achievement.description}</p>
                    <div class="achievement-progress-wrapper">
                        <div class="achievement-progress">
                            <div class="progress-bar ${status}" style="width: ${percentage}%;"></div>
                        </div>
                        <span class="progress-numbers">${progress.current}/${progress.required}</span>
                    </div>
                    <div class="unlock-status">
                        <i data-lucide="check" class="w-4 h-4"></i>
                        <span>Unlocked!</span>
                    </div>
                </div>
            </div>
        `;
    }
    render() {
        if (!this.container) return;
        const achievementsHTML = this.achievementsData.map((achievement)=>this.renderAchievementCard(achievement)).join('');
        this.container.innerHTML = `
            <div class="dashboard-achievements__list">
                ${achievementsHTML}
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    }
    updateProgress() {
        this.assessmentsCount = (0, _assessmentsJs.getAssessments)().length;
        this.render();
    }
}
// Initialize achievements on page load
document.addEventListener('DOMContentLoaded', ()=>{
    const achievementsManager = new AchievementsManager();
    achievementsManager.initialize();
});
function renderAchievements(completedCount) {
    const container = document.querySelector('.dashboard-achievements');
    if (!container) return;
    const achievements = getAchievements();
    const content = achievements.map((achievement)=>{
        const isUnlocked = completedCount >= achievement.goal;
        const progress = Math.min(completedCount, achievement.goal);
        const percentage = achievement.goal > 0 ? progress / achievement.goal * 100 : 0;
        const status = isUnlocked ? 'unlocked' : progress > 0 ? 'in-progress' : 'locked';
        const icon = isUnlocked ? 'check-circle-2' : achievement.icon;
        return `
            <div class="achievement-card ${status}">
                <div class="achievement-content">
                    <div class="achievement-header">
                        <i data-lucide="${icon}" class="achievement-icon ${status}"></i>
                        <span class="achievement-name ${status}">${achievement.name}</span>
                    </div>
                    <p class="achievement-description">${achievement.description}</p>
                    
                    <div class="achievement-progress-wrapper">
                        <div class="achievement-progress">
                            <div class="progress-bar ${status}" style="width: ${percentage}%"></div>
                        </div>
                        <span class="progress-numbers">${progress}/${achievement.goal}</span>
                    </div>
                    <div class="unlock-status">
                        <i data-lucide="check" class="w-4 h-4"></i>
                        <span>Unlocked!</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    container.innerHTML = `
        <div class="achievements-header">
            <h2 class="achievements-title">Achievements</h2>
            <i data-lucide="trophy" class="trophy-icon"></i>
        </div>
        <div class="achievements-grid">
            ${content}
        </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

},{"./assessments.js":"9eYtm","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"llSGL":[function(require,module,exports,__globalThis) {
/**
 * Injects admin-only UI components into the dashboard.
 * This function should only be called after verifying the user is an admin.
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "injectDashboardAdminUI", ()=>injectDashboardAdminUI);
function injectDashboardAdminUI() {
    const navMenu = document.querySelector('nav.space-y-2');
    if (!navMenu) {
        console.error("Admin UI injection point not found. Looking for nav.space-y-2");
        console.log("Available nav elements:", document.querySelectorAll('nav'));
        return;
    }
    // Check if the button already exists to prevent duplicates
    if (document.getElementById('importNavBtn')) return;
    const adminButtonHTML = `
        <button id="importNavBtn" onclick="switchTab('import')" class="dashboard-nav">
            <div class="dashboard-nav__content">
                <i data-lucide="upload" class="w-5 h-5"></i>
                <span class="dashboard-nav__text">Upload Tool Assessment</span>
            </div>
        </button>
    `;
    navMenu.insertAdjacentHTML('beforeend', adminButtonHTML);
    // Re-initialize icons if necessary
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"7DPt1":[function(require,module,exports,__globalThis) {
// js/dashboard/compare.js
// Logic for the Compare Tools tab: dynamic rendering, tool selection, and interactivity
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initCompareTools", ()=>initCompareTools);
parcelHelpers.export(exports, "setupEventListeners", ()=>setupEventListeners);
var _assessmentsJs = require("./assessments.js");
var _scoringJs = require("../assessment/scoring.js");
// Placeholder for tool data (to be replaced with real data integration)
let allTools = [];
let selectedTools = [];
let showModal = false;
let modalSearchTerm = '';
let expandedToolId = null;
function initCompareTools(toolData) {
    // Use only the user's real assessments as the source of truth
    allTools = toolData || [];
    showModal = false;
    modalSearchTerm = '';
    renderSummaryCards();
    renderSelectedTags();
    renderTable();
    renderLegend();
    renderModal();
    setupEventListeners();
}
function renderSummaryCards() {
    const total = selectedTools.length;
    const high = selectedTools.filter((t)=>(0, _scoringJs.getRiskLevel)(t.total_score || t.assessment_data && t.assessment_data.finalScore || 0) === 'high').length;
    const medium = selectedTools.filter((t)=>(0, _scoringJs.getRiskLevel)(t.total_score || t.assessment_data && t.assessment_data.finalScore || 0) === 'medium').length;
    const low = selectedTools.filter((t)=>(0, _scoringJs.getRiskLevel)(t.total_score || t.assessment_data && t.assessment_data.finalScore || 0) === 'low').length;
    const critical = selectedTools.filter((t)=>(0, _scoringJs.getRiskLevel)(t.total_score || t.assessment_data && t.assessment_data.finalScore || 0) === 'critical').length;
    document.getElementById('compare-summary-total').innerHTML = `<div class="compare-tools__summary-label">Total Tools</div><div class="compare-tools__summary-value">${total}</div>`;
    document.getElementById('compare-summary-high').innerHTML = `<div class="compare-tools__summary-label">High Risk</div><div class="compare-tools__summary-value">${high}</div>`;
    document.getElementById('compare-summary-medium').innerHTML = `<div class="compare-tools__summary-label">Medium Risk</div><div class="compare-tools__summary-value">${medium}</div>`;
    document.getElementById('compare-summary-low').innerHTML = `<div class="compare-tools__summary-label">Low Risk</div><div class="compare-tools__summary-value">${low}</div>`;
    document.getElementById('compare-summary-critical').innerHTML = `<div class="compare-tools__summary-label">Critical Risk</div><div class="compare-tools__summary-value">${critical}</div>`;
}
function renderSelectedTags() {
    const container = document.getElementById('compare-selected-tags');
    if (!container) return;
    container.innerHTML = selectedTools.map((tool)=>`
        <span class="compare-tools__tag">
            ${tool.name}
            <button class="compare-tools__tag-remove" data-tool-id="${tool.id}" title="Remove">&times;</button>
        </span>
    `).join('');
    if (selectedTools.length > 0) container.innerHTML += `<button class="compare-tools__clear-all-btn" title="Clear All">Clear All</button>`;
}
function getRiskColorClass(score) {
    const risk = (0, _scoringJs.getRiskLevel)(score);
    return `text-risk-${risk}`;
}
function renderTable() {
    const tbody = document.getElementById('compare-tools-table-body');
    if (!tbody) return;
    tbody.innerHTML = selectedTools.map((tool)=>{
        const ad = tool.assessment_data || {};
        const formData = ad.formData || {};
        const breakdown = ad.breakdown || {};
        const scores = breakdown.scores || {};
        const detailedAssessment = ad.detailedAssessment || {};
        const recommendations = ad.recommendations || [];
        const isExpanded = expandedToolId === tool.id;
        // Compliance info (ensure they are strings)
        const complianceCerts = Array.isArray(tool.compliance_certifications) ? tool.compliance_certifications.map(String).join(', ') : '-';
        const complianceSummary = ad.compliance_summary || detailedAssessment.compliance_summary || '-';
        // Recommendations
        const recs = recommendations.map((r)=>`
            <div class="compare-tools__recommendation">
                <div class="compare-tools__rec-bullet compare-tools__rec-priority--${r.priority}"></div>
                <div>
                    <h5 class="compare-tools__rec-title">${r.title}</h5>
                    <p class="compare-tools__rec-desc">${r.description}</p>
                    <span class="compare-tools__rec-meta">Priority: ${r.priority} | Category: ${r.category}</span>
                </div>
            </div>
        `).join('') || '<p>No recommendations available</p>';
        // Detailed Breakdown (ensure assessment_details is an object)
        const detailsHTML = (typeof detailedAssessment.assessment_details === 'object' && detailedAssessment.assessment_details !== null ? Object.entries(detailedAssessment.assessment_details) : []).map(([key, detail])=>{
            const categoryScore = detail.category_score || 0;
            return `
                <div class="compare-tools__detail-card">
                    <h5 class="compare-tools__detail-title">${key.replace(/_/g, ' ').replace(/\b\w/g, (char)=>char.toUpperCase())}</h5>
                    <div class="compare-tools__detail-score">Score: ${categoryScore}</div>
                    <div class="compare-tools__detail-content">
                        ${(typeof detail.criteria === 'object' && detail.criteria !== null ? Object.entries(detail.criteria) : []).map(([critKey, crit])=>`
                            <div class="compare-tools__detail-item">
                                <strong>${critKey.replace(/_/g, ' ').replace(/\b\w/g, (char)=>char.toUpperCase())}:</strong> ${crit.score} - ${crit.justification}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('') || '<p>No detailed assessment available</p>';
        // Compliance Icons (adapt from example)
        const complianceIcons = (typeof tool.compliance === 'object' && tool.compliance !== null ? Object.entries(tool.compliance) : []).map(([key, status])=>{
            const icon = status === 'compliant' ? '<i data-lucide="check-circle" class="compare-tools__compliance-icon compare-tools__compliance-icon--compliant"></i>' : '<i data-lucide="x-circle" class="compare-tools__compliance-icon compare-tools__compliance-icon--noncompliant"></i>';
            return `<div class="compare-tools__compliance-item">${icon} <span>${key.toUpperCase()}</span></div>`;
        }).join('') || '<p>No compliance data</p>';
        // Score values - Accessing from top-level `tool` object
        const dataStorage = tool.data_storage_score ?? '-';
        const trainingUsage = tool.training_usage_score ?? '-';
        const accessControls = tool.access_controls_score ?? '-';
        const complianceRisk = tool.compliance_score ?? '-';
        const vendorTransparency = tool.vendor_transparency_score ?? '-';
        const totalScore = tool.total_score || ad.finalScore || 0;
        const risk = (0, _scoringJs.getRiskLevel)(totalScore);
        return `
        <tr class="compare-tools__row compare-tools__row--${risk}">
            <td class="compare-tools__tool-cell" data-tool-id="${tool.id}" style="cursor: pointer;">
                <button class="compare-tools__expand-btn" aria-expanded="${isExpanded}">
                    <span class="chevron${isExpanded ? ' chevron--down' : ''}"></span>
                </button>
                <div class="compare-tools__tool-name">${tool.name || formData.toolName || 'Unknown Tool'}</div>
                <div class="compare-tools__tool-version">${formData.toolVersion ? formData.toolVersion : ''}</div>
                <div class="compare-tools__tool-category">${tool.vendor || formData.toolCategory || tool.category || ''}</div>
            </td>
            <td>
                <span class="compare-tools__tag compare-tools__tag--${risk}">
                    ${capitalize(risk)}
                </span>
            </td>
            <td><span class="compare-tools__score ${getRiskColorClass(totalScore)}">${totalScore}</span><span class="compare-tools__score-max">/100</span></td>
            <td><span class="compare-tools__score">${dataStorage}</span></td>
            <td><span class="compare-tools__score">${trainingUsage}</span></td>
            <td><span class="compare-tools__score">${accessControls}</span></td>
            <td><span class="compare-tools__score">${complianceRisk}</span></td>
            <td><span class="compare-tools__score">${vendorTransparency}</span></td>
            <!-- Removed Compliance Column -->
        </tr>
        <tr class="compare-tools__details-row" style="display:${isExpanded ? 'table-row' : 'none'}">
            <td colspan="8"> <!-- Changed colspan from 9 to 8 -->
                <div class="compare-tools__details">
                    <div class="compare-tools__tabs">
                        <button class="compare-tools__tab compare-tools__tab--active" data-tab="details" data-tool-id="${tool.id}">
                            <i data-lucide="bar-chart-3"></i>
                            Risk Assessment Details
                        </button>
                        <button class="compare-tools__tab" data-tab="recommendations" data-tool-id="${tool.id}">
                            <i data-lucide="lightbulb"></i>
                            Recommendations
                        </button>
                        <button class="compare-tools__tab" data-tab="compliance" data-tool-id="${tool.id}">
                            <i data-lucide="shield-check"></i>
                            Compliance Status
                        </button>
                    </div>
                    
                    <div class="compare-tools__tab-content compare-tools__tab-content--active" data-content="details">
                        <div class="compare-tools__details-grid">
                            ${detailsHTML}
                        </div>
                    </div>
                    
                    <div class="compare-tools__tab-content" data-content="recommendations">
                        <div class="compare-tools__recommendations-list">
                            ${recs}
                        </div>
                    </div>
                    
                    <div class="compare-tools__tab-content" data-content="compliance">
                        <div class="compare-tools__compliance-content">
                            <div class="compare-tools__compliance-grid">
                                ${complianceIcons}
                            </div>
                            <!-- Display detailed compliance summary -->
                            <div class="compare-tools__compliance-summary">
                                <p><strong>Data Classification:</strong> ${tool.data_classification || 'Not specified'}</p>
                                <p><strong>Use Case:</strong> ${tool.primary_use_case || 'Not specified'}</p>
                                <p><strong>Documentation Tier:</strong> ${tool.documentation_tier || 'Not specified'}</p>
                                <p><strong>Summary:</strong> ${complianceSummary}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
        `;
    }).join('');
    // Attach expand/collapse listeners to the tool cell
    tbody.querySelectorAll('.compare-tools__tool-cell').forEach((cell)=>{
        cell.addEventListener('click', (e)=>{
            if (e.target.closest('.compare-tools__expand-btn')) return; // Allow button click if needed, but since whole cell is clickable
            const toolId = cell.getAttribute('data-tool-id');
            expandedToolId = expandedToolId === toolId ? null : toolId;
            renderTable();
        });
    });
    // Add tab switching functionality
    tbody.querySelectorAll('.compare-tools__tab').forEach((tab)=>{
        tab.addEventListener('click', (e)=>{
            e.preventDefault();
            e.stopPropagation();
            const targetTab = tab.getAttribute('data-tab');
            const toolId = tab.getAttribute('data-tool-id');
            // Find the parent details container
            const detailsContainer = tab.closest('.compare-tools__details');
            // Remove active class from all tabs and content in this tool's details
            detailsContainer.querySelectorAll('.compare-tools__tab').forEach((t)=>t.classList.remove('compare-tools__tab--active'));
            detailsContainer.querySelectorAll('.compare-tools__tab-content').forEach((c)=>c.classList.remove('compare-tools__tab-content--active'));
            // Add active class to clicked tab and corresponding content
            tab.classList.add('compare-tools__tab--active');
            detailsContainer.querySelector(`[data-content="${targetTab}"]`).classList.add('compare-tools__tab-content--active');
        });
    });
    // Keep existing button listener for completeness
    tbody.querySelectorAll('.compare-tools__expand-btn').forEach((btn)=>{
        btn.addEventListener('click', (e)=>{
            const toolId = btn.getAttribute('data-tool-id');
            expandedToolId = expandedToolId === toolId ? null : toolId;
            renderTable();
        });
    });
    // Update the export button link
    const exportBtn = document.getElementById('compareExportBtn');
    if (exportBtn && selectedTools.length > 0) {
        const ids = selectedTools.map((t)=>t.id).join(',');
        exportBtn.href = `export.html?ids=${ids}`;
        exportBtn.classList.remove('disabled');
    } else if (exportBtn) {
        exportBtn.href = 'export.html';
        exportBtn.classList.add('disabled');
    }
}
function renderLegend() {
    document.getElementById('compare-tools-legend').innerHTML = `
      <div class="compare-tools__legend-title">Scoring Legend</div>
      <div class="compare-tools__legend-list">
        <div class="compare-tools__legend-item"><span class="compare-tools__legend-dot low"></span> Low Risk</div>
        <div class="compare-tools__legend-item"><span class="compare-tools__legend-dot medium"></span> Medium Risk</div>
        <div class="compare-tools__legend-item"><span class="compare-tools__legend-dot high"></span> High Risk</div>
        <div class="compare-tools__legend-item"><span class="compare-tools__legend-dot compliant"></span> Compliant</div>
      </div>
    `;
}
function renderModal() {
    let modal = document.getElementById('compare-tools-modal');
    if (!showModal) {
        if (modal) modal.remove();
        return;
    }
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'compare-tools-modal';
        document.body.appendChild(modal);
    }
    // --- Modal State for Multi-Select ---
    if (!window._modalSelectedTools) window._modalSelectedTools = [
        ...selectedTools
    ];
    let modalSelectedTools = window._modalSelectedTools;
    // --- Filters ---
    const riskLevels = [
        'ALL',
        'HIGH',
        'MEDIUM',
        'LOW'
    ];
    const vendors = Array.from(new Set(allTools.map((t)=>t.vendor).filter(Boolean)));
    const riskFilter = window._modalRiskFilter || 'ALL';
    const vendorFilter = window._modalVendorFilter || 'ALL';
    // --- Filtering ---
    const availableTools = allTools.filter((tool)=>{
        const matchesSearch = tool.name.toLowerCase().includes(modalSearchTerm.toLowerCase()) || tool.vendor && tool.vendor.toLowerCase().includes(modalSearchTerm.toLowerCase());
        const score = tool.total_score || tool.assessment_data && tool.assessment_data.finalScore || 0;
        const calculatedRisk = (0, _scoringJs.getRiskLevel)(score);
        const matchesRisk = riskFilter === 'ALL' || calculatedRisk.toUpperCase() === riskFilter;
        const matchesVendor = vendorFilter === 'ALL' || tool.vendor === vendorFilter;
        return matchesSearch && matchesRisk && matchesVendor;
    });
    // --- Modal HTML ---
    modal.innerHTML = `
      <div class="compare-tools__modal-overlay">
        <div class="compare-tools__modal-content">
          <div class="compare-tools__modal-header">
            <h2>Select AI Tools to Compare</h2>
            <button class="compare-tools__modal-close" title="Close">&times;</button>
          </div>
          <div class="compare-tools__modal-search-row">
            <div class="compare-tools__modal-search">
              <input type="text" class="compare-tools__modal-search-input" placeholder="Search AI tools..." value="${modalSearchTerm}" />
            </div>
            <select class="compare-tools__modal-filter" data-filter="risk">
              ${riskLevels.map((risk)=>`<option value="${risk}"${risk === riskFilter ? ' selected' : ''}>${risk === 'ALL' ? 'All Risk Levels' : risk.charAt(0) + risk.slice(1).toLowerCase() + ' Risk'}</option>`).join('')}
            </select>
            <select class="compare-tools__modal-filter" data-filter="vendor">
              <option value="ALL"${vendorFilter === 'ALL' ? ' selected' : ''}>All Vendors</option>
              ${vendors.map((vendor)=>`<option value="${vendor}"${vendor === vendorFilter ? ' selected' : ''}>${vendor}</option>`).join('')}
            </select>
          </div>
          <div class="compare-tools__modal-list-grid">
            ${availableTools.length === 0 ? '<div class="compare-tools__modal-empty">No tools found</div>' : availableTools.map((tool)=>{
        const isSelected = modalSelectedTools.some((t)=>String(t.id) === String(tool.id));
        const score = tool.total_score || tool.assessment_data && tool.assessment_data.finalScore || 0;
        const risk = (0, _scoringJs.getRiskLevel)(score);
        return `
                  <div class="compare-tools__modal-item${isSelected ? ' compare-tools__modal-item--selected' : ''}" data-tool-id="${tool.id}">
                    <div class="compare-tools__modal-item-check">${isSelected ? '&#10003;' : ''}</div>
                    <div class="compare-tools__modal-item-info">
                      <div class="compare-tools__modal-item-name">${tool.name}</div>
                      <div class="compare-tools__modal-item-vendor">${tool.vendor || ''}</div>
                    </div>
                    <div class="compare-tools__modal-item-score-group">
                      <span class="compare-tools__modal-item-score compare-tools__modal-item-score--${risk} text-risk-${risk}">${score}</span>
                      ${getRiskBadge(risk, score)}
                    </div>
                  </div>
                `;
    }).join('')}
          </div>
          <div class="compare-tools__modal-footer">
            <button class="compare-tools__modal-cancel">Cancel</button>
            <button class="compare-tools__modal-apply">Apply Selection</button>
          </div>
        </div>
      </div>
    `;
}
function setupEventListeners() {
    if (window._compareEventListenersAttached) return;
    window._compareEventListenersAttached = true;
    document.body.addEventListener('click', async (e)=>{
        const addBtn = e.target.closest('.compare-tools__add-btn');
        if (addBtn) {
            if (addBtn.disabled) return;
            addBtn.disabled = true;
            addBtn.classList.add('loading');
            try {
                await (0, _assessmentsJs.loadAssessments)();
                initCompareTools((0, _assessmentsJs.getAssessments)());
                window._modalSelectedTools = [
                    ...selectedTools
                ];
                showModal = true;
                modalSearchTerm = '';
                renderModal();
                setupModalListeners();
            } finally{
                addBtn.disabled = false;
                addBtn.classList.remove('loading');
            }
        }
        const tagRemoveBtn = e.target.closest('.compare-tools__tag-remove');
        if (tagRemoveBtn) {
            const toolId = tagRemoveBtn.getAttribute('data-tool-id');
            selectedTools = selectedTools.filter((t)=>String(t.id) !== String(toolId));
            renderSummaryCards();
            renderSelectedTags();
            renderTable();
        }
        if (e.target.closest('.compare-tools__clear-all-btn')) {
            selectedTools = [];
            renderSummaryCards();
            renderSelectedTags();
            renderTable();
        }
    });
}
function setupModalListeners() {
    const modal = document.getElementById('compare-tools-modal');
    if (!modal) return;
    // Close modal
    modal.querySelector('.compare-tools__modal-close').addEventListener('click', ()=>{
        showModal = false;
        window._modalSelectedTools = undefined;
        renderModal();
    });
    modal.querySelector('.compare-tools__modal-overlay').addEventListener('click', (e)=>{
        if (e.target === modal.querySelector('.compare-tools__modal-overlay')) {
            showModal = false;
            window._modalSelectedTools = undefined;
            renderModal();
        }
    });
    // Search input
    modal.querySelector('.compare-tools__modal-search-input').addEventListener('input', (e)=>{
        const value = e.target.value;
        const cursorPos = e.target.selectionStart;
        window._modalSearchTerm = value;
        updateModalToolList();
        // Restore focus and cursor position
        const input = document.querySelector('.compare-tools__modal-search-input');
        if (input) {
            input.focus();
            input.setSelectionRange(cursorPos, cursorPos);
        }
    });
    // Filter dropdowns
    modal.querySelectorAll('.compare-tools__modal-filter').forEach((select)=>{
        select.addEventListener('change', (e)=>{
            if (select.dataset.filter === 'risk') window._modalRiskFilter = select.value;
            else if (select.dataset.filter === 'vendor') window._modalVendorFilter = select.value;
            updateModalToolList();
        });
    });
    // Tool selection (multi-select)
    modal.querySelectorAll('.compare-tools__modal-item').forEach((item)=>{
        item.addEventListener('click', (e)=>{
            e.stopPropagation(); // Prevent bubbling to overlay
            const toolId = item.getAttribute('data-tool-id');
            let modalSelectedTools = window._modalSelectedTools || [];
            const idx = modalSelectedTools.findIndex((t)=>String(t.id) === String(toolId));
            if (idx > -1) modalSelectedTools.splice(idx, 1);
            else {
                const tool = allTools.find((t)=>String(t.id) === String(toolId));
                if (tool) modalSelectedTools.push(tool);
            }
            window._modalSelectedTools = modalSelectedTools;
            updateModalToolList();
        });
    });
    // Prevent modal content clicks from bubbling to overlay
    modal.querySelector('.compare-tools__modal-content').addEventListener('click', (e)=>{
        e.stopPropagation();
    });
    // Cancel button
    modal.querySelector('.compare-tools__modal-cancel').addEventListener('click', ()=>{
        showModal = false;
        window._modalSelectedTools = undefined;
        renderModal();
    });
    // Apply button
    modal.querySelector('.compare-tools__modal-apply').addEventListener('click', ()=>{
        selectedTools = [
            ...window._modalSelectedTools || []
        ];
        showModal = false;
        window._modalSelectedTools = undefined;
        renderSummaryCards();
        renderSelectedTags();
        renderTable();
        renderModal();
    });
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
// Add helper for risk badge
function getRiskBadge(risk, score) {
    let color = '', icon = '', label = '';
    switch((risk || '').toLowerCase()){
        case 'critical':
            color = 'compare-tools__risk-badge--critical';
            icon = "\uD83D\uDED1";
            label = 'CRITICAL';
            break;
        case 'high':
            color = 'compare-tools__risk-badge--high';
            icon = "\u26A0\uFE0F";
            label = 'HIGH';
            break;
        case 'medium':
            color = 'compare-tools__risk-badge--medium';
            icon = "\uD83D\uDFE1";
            label = 'MEDIUM';
            break;
        case 'low':
        default:
            color = 'compare-tools__risk-badge--low';
            icon = "\u2714\uFE0F";
            label = 'LOW';
            break;
    }
    return `<span class="compare-tools__risk-badge ${color}">${icon} ${label}</span>`;
}
// Add this helper to update only the tool list in the modal
function updateModalToolList() {
    const modal = document.getElementById('compare-tools-modal');
    if (!modal) return;
    const listGrid = modal.querySelector('.compare-tools__modal-list-grid');
    if (!listGrid) return;
    // Use the same filtering/search logic as in renderModal
    const riskFilter = window._modalRiskFilter || 'ALL';
    const vendorFilter = window._modalVendorFilter || 'ALL';
    const modalSearchTerm = window._modalSearchTerm || '';
    const modalSelectedTools = window._modalSelectedTools || [];
    const availableTools = allTools.filter((tool)=>{
        const matchesSearch = tool.name.toLowerCase().includes(modalSearchTerm.toLowerCase()) || tool.vendor && tool.vendor.toLowerCase().includes(modalSearchTerm.toLowerCase());
        const score = tool.total_score || tool.assessment_data && tool.assessment_data.finalScore || 0;
        const calculatedRisk = (0, _scoringJs.getRiskLevel)(score);
        const matchesRisk = riskFilter === 'ALL' || calculatedRisk.toUpperCase() === riskFilter;
        const matchesVendor = vendorFilter === 'ALL' || tool.vendor === vendorFilter;
        return matchesSearch && matchesRisk && matchesVendor;
    });
    listGrid.innerHTML = availableTools.length === 0 ? '<div class="compare-tools__modal-empty">No tools found</div>' : availableTools.map((tool)=>{
        const isSelected = modalSelectedTools.some((t)=>String(t.id) === String(tool.id));
        const score = tool.total_score || tool.assessment_data && tool.assessment_data.finalScore || 0;
        const risk = (0, _scoringJs.getRiskLevel)(score);
        return `
              <div class="compare-tools__modal-item${isSelected ? ' compare-tools__modal-item--selected' : ''}" data-tool-id="${tool.id}">
                <div class="compare-tools__modal-item-check">${isSelected ? '&#10003;' : ''}</div>
                <div class="compare-tools__modal-item-info">
                  <div class="compare-tools__modal-item-name">${tool.name}</div>
                  <div class="compare-tools__modal-item-vendor">${tool.vendor || ''}</div>
                </div>
                <div class="compare-tools__modal-item-score-group">
                  <span class="compare-tools__modal-item-score compare-tools__modal-item-score--${risk} text-risk-${risk}">${score}</span>
                  ${getRiskBadge(risk, score)}
                </div>
              </div>
            `;
    }).join('');
    // Re-attach listeners for tool selection
    listGrid.querySelectorAll('.compare-tools__modal-item').forEach((item)=>{
        item.addEventListener('click', (e)=>{
            e.stopPropagation();
            const toolId = item.getAttribute('data-tool-id');
            let modalSelectedTools = window._modalSelectedTools || [];
            const idx = modalSelectedTools.findIndex((t)=>String(t.id) === String(toolId));
            if (idx > -1) modalSelectedTools.splice(idx, 1);
            else {
                const tool = allTools.find((t)=>String(t.id) === String(toolId));
                if (tool) modalSelectedTools.push(tool);
            }
            window._modalSelectedTools = modalSelectedTools;
            updateModalToolList();
        });
    });
}

},{"./assessments.js":"9eYtm","../assessment/scoring.js":"2mnUO","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"2mnUO":[function(require,module,exports,__globalThis) {
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
    const updatedDetailedAssessment = {
        ...dbData.detailed_assessment || {},
        final_risk_score: totalScore,
        final_risk_category: getRiskLevel(totalScore),
        final_score_with_multiplier: totalScore,
        assessment_details: {
            ...dbData.detailed_assessment?.assessment_details || {},
            data_storage_and_security: {
                ...dbData.detailed_assessment?.assessment_details?.data_storage_and_security || {},
                category_score: baseScores.dataStorage,
                criteria: (()=>{
                    const oldCriteria = dbData.detailed_assessment?.assessment_details?.data_storage_and_security?.criteria || {};
                    const oldCategoryScore = dbData.detailed_assessment?.assessment_details?.data_storage_and_security?.category_score || 0;
                    const newCategoryScore = baseScores.dataStorage;
                    const scalingFactor = oldCategoryScore !== 0 ? newCategoryScore / oldCategoryScore : newCategoryScore > 0 ? 1 : 0;
                    const updatedCriteria = {};
                    for(const key in oldCriteria)if (oldCriteria[key] && typeof oldCriteria[key].score === 'number') updatedCriteria[key] = {
                        ...oldCriteria[key],
                        score: Math.round(oldCriteria[key].score * scalingFactor)
                    };
                    else updatedCriteria[key] = oldCriteria[key];
                    return updatedCriteria;
                })()
            },
            training_data_usage: {
                ...dbData.detailed_assessment?.assessment_details?.training_data_usage || {},
                category_score: baseScores.trainingUsage,
                criteria: (()=>{
                    const oldCriteria = dbData.detailed_assessment?.assessment_details?.training_data_usage?.criteria || {};
                    const oldCategoryScore = dbData.detailed_assessment?.assessment_details?.training_data_usage?.category_score || 0;
                    const newCategoryScore = baseScores.trainingUsage;
                    const scalingFactor = oldCategoryScore !== 0 ? newCategoryScore / oldCategoryScore : newCategoryScore > 0 ? 1 : 0;
                    const updatedCriteria = {};
                    for(const key in oldCriteria)if (oldCriteria[key] && typeof oldCriteria[key].score === 'number') updatedCriteria[key] = {
                        ...oldCriteria[key],
                        score: Math.round(oldCriteria[key].score * scalingFactor)
                    };
                    else updatedCriteria[key] = oldCriteria[key];
                    return updatedCriteria;
                })()
            },
            access_controls: {
                ...dbData.detailed_assessment?.assessment_details?.access_controls || {},
                category_score: baseScores.accessControls,
                criteria: (()=>{
                    const oldCriteria = dbData.detailed_assessment?.assessment_details?.access_controls?.criteria || {};
                    const oldCategoryScore = dbData.detailed_assessment?.assessment_details?.access_controls?.category_score || 0;
                    const newCategoryScore = baseScores.accessControls;
                    const scalingFactor = oldCategoryScore !== 0 ? newCategoryScore / oldCategoryScore : newCategoryScore > 0 ? 1 : 0;
                    const updatedCriteria = {};
                    for(const key in oldCriteria)if (oldCriteria[key] && typeof oldCriteria[key].score === 'number') updatedCriteria[key] = {
                        ...oldCriteria[key],
                        score: Math.round(oldCriteria[key].score * scalingFactor)
                    };
                    else updatedCriteria[key] = oldCriteria[key];
                    return updatedCriteria;
                })()
            },
            compliance_and_legal_risk: {
                ...dbData.detailed_assessment?.assessment_details?.compliance_and_legal_risk || {},
                category_score: baseScores.complianceRisk,
                criteria: (()=>{
                    const oldCriteria = dbData.detailed_assessment?.assessment_details?.compliance_and_legal_risk?.criteria || {};
                    const oldCategoryScore = dbData.detailed_assessment?.assessment_details?.compliance_and_legal_risk?.category_score || 0;
                    const newCategoryScore = baseScores.complianceRisk;
                    const scalingFactor = oldCategoryScore !== 0 ? newCategoryScore / oldCategoryScore : newCategoryScore > 0 ? 1 : 0;
                    const updatedCriteria = {};
                    for(const key in oldCriteria)if (oldCriteria[key] && typeof oldCriteria[key].score === 'number') updatedCriteria[key] = {
                        ...oldCriteria[key],
                        score: Math.round(oldCriteria[key].score * scalingFactor)
                    };
                    else updatedCriteria[key] = oldCriteria[key];
                    return updatedCriteria;
                })()
            },
            vendor_transparency: {
                ...dbData.detailed_assessment?.assessment_details?.vendor_transparency || {},
                category_score: baseScores.vendorTransparency,
                criteria: (()=>{
                    const oldCriteria = dbData.detailed_assessment?.assessment_details?.vendor_transparency?.criteria || {};
                    const oldCategoryScore = dbData.detailed_assessment?.assessment_details?.vendor_transparency?.category_score || 0;
                    const newCategoryScore = baseScores.vendorTransparency;
                    const scalingFactor = oldCategoryScore !== 0 ? newCategoryScore / oldCategoryScore : newCategoryScore > 0 ? 1 : 0;
                    const updatedCriteria = {};
                    for(const key in oldCriteria)if (oldCriteria[key] && typeof oldCriteria[key].score === 'number') updatedCriteria[key] = {
                        ...oldCriteria[key],
                        score: Math.round(oldCriteria[key].score * scalingFactor)
                    };
                    else updatedCriteria[key] = oldCriteria[key];
                    return updatedCriteria;
                })()
            }
        }
    };
    return {
        ...dbData,
        total_score: totalScore,
        risk_level: getRiskLevel(totalScore),
        compliance_certifications: dbData.compliance_certifications || [],
        breakdown: {
            ...dbData.breakdown,
            scores: baseScores
        },
        detailed_assessment: updatedDetailedAssessment
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

},{"@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}]},["kirti","80B5u"], "80B5u", "parcelRequire4b35", {})

//# sourceMappingURL=dashboard.74e1f630.js.map
