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
})({"i40gp":[function(require,module,exports,__globalThis) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SERVER_PORT = 65124;
var HMR_SECURE = false;
var HMR_ENV_HASH = "439701173a9199ea";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "27a8def185d8833b";
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

},{}],"4IY3I":[function(require,module,exports,__globalThis) {
// docs/js/dashboard/export.js
var _supabaseJs = require("@supabase/supabase-js");
var _reportGenerationJs = require("./export/report-generation.js");
// --- Supabase Client ---
const SUPABASE_URL = 'https://lgybmsziqjdmmxdiyils.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneWJtc3ppcWpkbW14ZGl5aWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTAzOTcsImV4cCI6MjA2NjI4NjM5N30.GFqiwK2qi3TnlUDCmdFZpG69pqdPP-jpbxdUGX6VlSg';
const supabase = (0, _supabaseJs.createClient)(SUPABASE_URL, SUPABASE_ANON_KEY);
// --- State ---
let allAssessments = [];
const selectedAssessmentIds = new Set();
let selectedTemplate = 'summary'; // Default to summary template
let currentMode = 'template'; // 'template' or 'custom'
let selectedTheme = 'theme-professional'; // Default to professional theme
let customSelectedSections = new Set(); // For mix-and-match
// Flag to ensure event listeners are attached only once
let listenersAttached = false;
// Define template sections for quick select
const quickTemplates = {
    summary: {
        name: 'Executive Summary',
        sections: [
            'summary-section'
        ],
        pages: '3-4 pages'
    },
    detailed: {
        name: 'Detailed Technical Report',
        sections: [
            'summary-section',
            'detailed-breakdown-section',
            'recommendations-section'
        ],
        pages: '8-12 pages'
    },
    comparison: {
        name: 'Comparison Report',
        sections: [
            'summary-section',
            'comparison-table-section'
        ],
        pages: '5-7 pages'
    },
    premium: {
        name: 'Premium Report',
        sections: [
            'summary-section',
            'detailed-breakdown-section',
            'recommendations-section',
            'premium-section'
        ],
        pages: '12-15 pages'
    }
};
// Map for data-section to display name (for custom selections)
const sectionDisplayNames = {
    summary: 'Executive Summary',
    detailed: 'Detailed Breakdown',
    recommendations: 'Recommendations',
    comparison: 'Comparison Table',
    // Add display names for new sections
    'detailed-breakdown-section': 'Detailed Breakdown',
    'recommendations-section': 'Key Recommendations',
    'comparison-table-section': 'Comparison Table'
};
// --- DOM Elements ---
const assessmentSelector = document.getElementById('assessment-selector');
const templateSelector = document.querySelector('.template-selector--quick-select'); // This is now the quick-select container
const mixMatchSelector = document.querySelector('.mix-match-selector'); // This is for custom sections
const previewReportBtn = document.getElementById('previewReportBtn');
const generateHelpText = document.getElementById('generateHelpText');
const customNotice = document.getElementById('custom-notice');
const modeIndicator = document.querySelector('.export-mode-indicator');
const previewSectionsContainer = document.getElementById('preview-sections');
const previewStatus = document.querySelector('.export-preview-status');
// themeSelector removed - now using theme gallery system
// --- Initialization ---
document.addEventListener('DOMContentLoaded', ()=>{
    init();
});
async function init() {
    console.log('init(): Starting initialization...');
    // Perform initial session check immediately
    const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
    if (getSessionError) {
        console.error('init(): Error getting session:', getSessionError);
        handleAuthError('Error fetching user session.');
        return;
    }
    if (session) {
        console.log('init(): User session found.', session.user);
        // User is logged in initially
        await loadAssessments();
        setupEventListeners();
    } else {
        console.log('init(): No user session found.');
        // User is not logged in initially
        handleAuthError('No active user session. Please log in.');
    }
    // Initialize tab navigation and theme gallery
    initializeTabNavigation();
    initializeThemeGallery();
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') lucide.createIcons();
    // Set up listener for subsequent auth state changes
    supabase.auth.onAuthStateChange(async (event, session)=>{
        console.log('onAuthStateChange event:', event, 'session:', session);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
            if (session) {
                console.log('onAuthStateChange: User session active or refreshed.');
                // Only load if assessments haven't been loaded yet OR if the session changes to logged in
                // This prevents re-loading if already successfully loaded on init()
                if (allAssessments.length === 0) {
                    await loadAssessments();
                    setupEventListeners(); // Re-set up listeners if elements changed/re-rendered
                }
            }
        } else if (event === 'SIGNED_OUT') {
            console.log('onAuthStateChange: User signed out.');
            handleAuthError('User signed out. Please log in again.');
        }
    });
}
// Initialize tab navigation
function initializeTabNavigation() {
    const tabs = document.querySelectorAll('.export-nav__tab');
    const tabContents = document.querySelectorAll('.export-tab-content');
    tabs.forEach((tab)=>{
        tab.addEventListener('click', ()=>{
            if (tab.classList.contains('export-nav__tab--disabled')) return;
            const targetTab = tab.dataset.tab;
            // Update active tab
            tabs.forEach((t)=>t.classList.remove('export-nav__tab--active'));
            tab.classList.add('export-nav__tab--active');
            // Update active content
            tabContents.forEach((content)=>{
                content.classList.remove('export-tab-content--active');
            });
            const targetContent = document.getElementById(`${targetTab}-content`);
            if (targetContent) targetContent.classList.add('export-tab-content--active');
            // Re-initialize Lucide icons for new content
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    });
}
// Initialize theme gallery
function initializeThemeGallery() {
    const themeCards = document.querySelectorAll('.theme-card');
    const previewMock = document.getElementById('theme-preview-mock');
    const currentThemeName = document.getElementById('current-theme-name');
    const applyThemeBtn = document.getElementById('apply-theme-btn');
    const previewWithThemeBtn = document.getElementById('preview-with-theme-btn');
    // Theme configurations for preview updates
    const themeConfigs = {
        'theme-professional': {
            name: 'Professional Theme',
            headerColor: '#1e40af',
            scoreColor: '#1e40af',
            scoreBg: '#eff6ff'
        },
        'theme-executive': {
            name: 'Executive Theme',
            headerColor: '#1e3a8a',
            scoreColor: '#1e3a8a',
            scoreBg: '#eff6ff'
        },
        'theme-modern': {
            name: 'Modern Theme',
            headerColor: '#7c3aed',
            scoreColor: '#7c3aed',
            scoreBg: '#f3e8ff'
        },
        'theme-dark': {
            name: 'Dark Theme',
            headerColor: '#111827',
            scoreColor: '#a855f7',
            scoreBg: '#1f2937'
        }
    };
    // Handle theme card selection
    themeCards.forEach((card)=>{
        card.addEventListener('click', ()=>{
            const themeId = card.dataset.theme;
            // Update selected state
            themeCards.forEach((c)=>c.classList.remove('theme-card--selected'));
            card.classList.add('theme-card--selected');
            // Update global selected theme
            selectedTheme = themeId;
            // Update live preview
            updateThemePreview(themeId, themeConfigs[themeId]);
        });
    });
    // Apply theme button
    if (applyThemeBtn) applyThemeBtn.addEventListener('click', ()=>{
        // Switch to configure tab
        const configureTab = document.getElementById('configure-tab');
        if (configureTab) configureTab.click();
        // Show success message or update UI to indicate theme applied
        showThemeAppliedMessage();
    });
    // Preview with theme button
    if (previewWithThemeBtn) previewWithThemeBtn.addEventListener('click', ()=>{
        // Generate preview with selected theme
        generatePreview();
    });
    // Initialize with default theme
    updateThemePreview('theme-professional', themeConfigs['theme-professional']);
}
// Update theme preview mock
function updateThemePreview(themeId, config) {
    const previewMock = document.getElementById('theme-preview-mock');
    const currentThemeName = document.getElementById('current-theme-name');
    const selectedThemeName = document.getElementById('selected-theme-name');
    if (!config) return;
    // Update theme name in both locations
    if (currentThemeName) currentThemeName.textContent = config.name;
    if (selectedThemeName) selectedThemeName.textContent = config.name;
    // Update preview mock colors
    if (previewMock) {
        const header = previewMock.querySelector('.theme-preview-mock__header');
        const score = previewMock.querySelector('.theme-preview-mock__score');
        if (header) header.style.backgroundColor = config.headerColor;
        if (score) {
            score.style.color = config.scoreColor;
            score.style.backgroundColor = config.scoreBg;
        }
    }
}
// Show theme applied message
function showThemeAppliedMessage() {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'theme-applied-notification';
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-weight: 500;
        ">
            \u{2713} Theme applied successfully!
        </div>
    `;
    document.body.appendChild(notification);
    // Remove after 3 seconds
    setTimeout(()=>{
        if (notification.parentNode) notification.parentNode.removeChild(notification);
    }, 3000);
}
function handleAuthError(message) {
    console.log('handleAuthError:', message);
    assessmentSelector.innerHTML = `<p class="text-red-400">${message}</p>`;
    previewReportBtn.disabled = true;
    generateHelpText.textContent = 'Please log in to enable export features.';
    allAssessments = [];
    selectedAssessmentIds.clear();
    renderAssessmentSelector(); // Clear any rendered items
    updateUI(); // Update overall UI state
}
// --- Data Loading ---
async function loadAssessments() {
    console.log('loadAssessments(): Attempting to fetch assessments...');
    try {
        const { data, error } = await supabase.from('assessments').select('*').order('created_at', {
            ascending: false
        });
        if (error) {
            console.error('loadAssessments(): Supabase fetch error:', error);
            throw error;
        }
        if (data) {
            console.log('loadAssessments(): Assessments fetched successfully.', data.length, 'items.');
            // Process fetched data to merge nested assessment_data properties
            allAssessments = data.map((assessment)=>{
                if (assessment.assessment_data && typeof assessment.assessment_data === 'object') // Merge assessment_data properties into the top-level assessment object
                return {
                    ...assessment,
                    ...assessment.assessment_data
                };
                return assessment;
            });
            parseURLParams();
            renderAssessmentSelector();
            updateUI();
        } else {
            console.log('loadAssessments(): No data received from Supabase.');
            assessmentSelector.innerHTML = '<p class="text-gray-400">No assessments found.</p>';
            updateUI();
        }
    } catch (error) {
        console.error('loadAssessments(): Error loading assessments:', error);
        assessmentSelector.innerHTML = '<p class="text-red-400">Error loading assessments. Please try again later.</p>';
        updateUI();
    }
}
function parseURLParams() {
    console.log('parseURLParams(): Parsing URL parameters...');
    const params = new URLSearchParams(window.location.search);
    const ids = params.get('ids');
    if (ids) ids.split(',').forEach((id)=>selectedAssessmentIds.add(id));
}
// --- UI Rendering ---
function renderAssessmentSelector() {
    console.log('renderAssessmentSelector(): Rendering assessment selector with', allAssessments.length, 'assessments.');
    if (!allAssessments.length) {
        assessmentSelector.innerHTML = '<p class="text-gray-400">No assessments found.</p>';
        return;
    }
    const html = allAssessments.map((assessment)=>{
        const isChecked = selectedAssessmentIds.has(assessment.id);
        return `
            <div class="assessment-item-row">
                <input type="checkbox" id="assessment-${assessment.id}" data-id="${assessment.id}" ${isChecked ? 'checked' : ''}>
                <label for="assessment-${assessment.id}" class="assessment-item-info">
                    <div class="assessment-item-name">${assessment.name}</div>
                    <div class="assessment-item-category">${assessment.category || 'N/A'}</div>
                </label>
                <span class="assessment-item-score risk-${assessment.risk_level}">${assessment.total_score}</span>
            </div>
        `;
    }).join('');
    assessmentSelector.innerHTML = html;
}
// --- Event Listeners ---
function setupEventListeners() {
    if (listenersAttached) {
        console.log('setupEventListeners(): Listeners already attached, skipping.');
        return;
    }
    console.log('setupEventListeners(): Attaching event listeners...');
    // Quick Select Template selection
    templateSelector.addEventListener('click', (e)=>{
        const card = e.target.closest('.template-card');
        if (!card || card.classList.contains('disabled')) return; // Ignore clicks on disabled cards
        // Clear previous template selection
        templateSelector.querySelectorAll('.template-card').forEach((c)=>c.classList.remove('selected'));
        // Add new selection
        card.classList.add('selected');
        selectedTemplate = card.dataset.template;
        currentMode = 'template';
        // Clear custom sections when a quick template is selected
        mixMatchSelector.querySelectorAll('input[type="checkbox"]').forEach((checkbox)=>{
            checkbox.checked = false;
        });
        customSelectedSections.clear();
        updateUI();
    });
    // Assessment selection (remains the same)
    assessmentSelector.addEventListener('change', (e)=>{
        if (e.target.type === 'checkbox') {
            const id = e.target.dataset.id;
            if (e.target.checked) selectedAssessmentIds.add(id);
            else selectedAssessmentIds.delete(id);
            updateUI();
        }
    });
    // Generate button
    previewReportBtn.addEventListener('click', ()=>(0, _reportGenerationJs.prepareReportData)(selectedAssessmentIds, allAssessments, quickTemplates, selectedTemplate, currentMode, customSelectedSections, selectedTheme));
    // Mix-and-match sections selection
    mixMatchSelector.addEventListener('change', (e)=>{
        if (e.target.type === 'checkbox') {
            const sectionId = e.target.dataset.section;
            // We store the filename-friendly ID in the set
            const sectionFilename = `${sectionId}-section`; // e.g., 'summary-section'
            if (e.target.checked) customSelectedSections.add(sectionFilename);
            else customSelectedSections.delete(sectionFilename);
            if (customSelectedSections.size > 0) {
                currentMode = 'custom';
                // Deselect quick template if custom section is chosen
                templateSelector.querySelectorAll('.template-card').forEach((c)=>c.classList.remove('selected'));
                selectedTemplate = null; // No quick template selected
            } else {
                // If no custom sections, revert to default quick template
                currentMode = 'template';
                selectedTemplate = 'summary';
                templateSelector.querySelector('[data-template="summary"]').classList.add('selected');
            }
            updateUI();
        }
    });
    // Theme selector functionality is now handled by initializeThemeGallery()
    // After all listeners are set up, set the flag to true
    listenersAttached = true;
}
// --- UI State Management ---
function updateUI() {
    console.log('updateUI(): Updating UI based on current state.');
    let canGenerate = true;
    let helpText = '';
    const selectedAssessmentsCount = selectedAssessmentIds.size;
    // Determine if a template or custom sections are selected
    const isTemplateSelected = currentMode === 'template' && selectedTemplate;
    const isCustomSectionSelected = currentMode === 'custom' && customSelectedSections.size > 0;
    if (selectedAssessmentsCount === 0) {
        canGenerate = false;
        helpText = 'Please select at least one assessment.';
    } else if (!isTemplateSelected && !isCustomSectionSelected) {
        canGenerate = false;
        helpText = 'Please choose a quick template or select custom sections.';
    } else if (selectedTemplate === 'comparison' && selectedAssessmentsCount < 2) {
        canGenerate = false;
        helpText = 'The Comparison Report requires at least two assessments.';
    } else {
        let reportTypeName = '';
        if (currentMode === 'template' && selectedTemplate) reportTypeName = quickTemplates[selectedTemplate].name;
        else if (currentMode === 'custom') reportTypeName = `Custom Report with ${customSelectedSections.size} section${customSelectedSections.size !== 1 ? 's' : ''}`;
        helpText = `Ready to generate a ${reportTypeName} for ${selectedAssessmentsCount} assessment(s).`;
    }
    previewReportBtn.disabled = !canGenerate;
    generateHelpText.textContent = helpText;
    // Update custom notice visibility/text
    if (currentMode === 'custom') {
        customNotice.classList.add('active');
        customNotice.textContent = `Custom report with ${customSelectedSections.size} section${customSelectedSections.size !== 1 ? 's' : ''} selected.`;
    } else {
        customNotice.classList.remove('active');
        customNotice.textContent = 'Select sections below to create a custom report';
    }
    // Update Preview Section
    previewSectionsContainer.innerHTML = ''; // Clear previous items
    let sectionsToDisplay = [];
    let estimatedPagesText = '';
    let reportTitleForButton = 'Generate Report';
    if (currentMode === 'template' && selectedTemplate) {
        const templateInfo = quickTemplates[selectedTemplate];
        // Use the sections array from quickTemplates as they are already display-friendly
        sectionsToDisplay = templateInfo.sections.map((sectionId)=>sectionDisplayNames[sectionId.replace('-section', '')] || sectionId); // Map filename to display name
        estimatedPagesText = templateInfo.pages;
        modeIndicator.className = 'export-mode-indicator template';
        modeIndicator.innerHTML = `\u{1F4CB} Using ${templateInfo.name} Template`;
        reportTitleForButton = `\u{1F4C4} Generate ${templateInfo.name} Report`;
    } else if (currentMode === 'custom' && customSelectedSections.size > 0) {
        // Map custom selected section filenames to display names for preview
        sectionsToDisplay = Array.from(customSelectedSections).map((sectionFilename)=>{
            const sectionId = sectionFilename.replace('-section', '');
            return sectionDisplayNames[sectionId] || sectionId; // Fallback to ID if no display name
        });
        const estimatedPages = Math.max(2, sectionsToDisplay.length); // Minimum 2 pages for custom
        estimatedPagesText = `${estimatedPages} page${estimatedPages !== 1 ? 's' : ''}`;
        modeIndicator.className = 'export-mode-indicator custom';
        modeIndicator.innerHTML = "\u2699\uFE0F Using Custom Configuration";
        reportTitleForButton = "\uD83D\uDCC4 Generate Custom Report";
    } else {
        // Default state when nothing is selected or an invalid state
        modeIndicator.className = 'export-mode-indicator';
        modeIndicator.textContent = '';
        estimatedPagesText = '';
        reportTitleForButton = 'Generate Report';
    }
    sectionsToDisplay.forEach((section)=>{
        const item = document.createElement('div');
        item.className = 'preview-item';
        item.innerHTML = `\u{2713} ${section}`;
        previewSectionsContainer.appendChild(item);
    });
    previewStatus.innerHTML = `<strong>${currentMode === 'template' && selectedTemplate ? quickTemplates[selectedTemplate].name + ' Template' : 'Custom Report'}</strong> \u{2022} Estimated length: ${estimatedPagesText}`;
    previewReportBtn.innerHTML = `<i data-lucide="eye" class="w-5 h-5 mr-2"></i><span>Preview Report</span>`;
    // Disable comparison template if less than 2 assessments are selected
    const comparisonCard = templateSelector.querySelector('[data-template="comparison"]');
    if (comparisonCard) {
        if (selectedAssessmentsCount < 2) {
            comparisonCard.classList.add('disabled');
            // If it was selected, unselect it and revert to summary if no custom sections
            if (selectedTemplate === 'comparison') {
                selectedTemplate = 'summary';
                currentMode = 'template'; // Revert mode to template as a summary is now selected
                templateSelector.querySelector('[data-template="summary"]').classList.add('selected');
                comparisonCard.classList.remove('selected');
                mixMatchSelector.querySelectorAll('input[type="checkbox"]').forEach((checkbox)=>checkbox.checked = false);
                customSelectedSections.clear();
            }
        } else comparisonCard.classList.remove('disabled');
    }
    // Ensure the default template is selected initially if no custom sections are active
    if (currentMode === 'template' && !selectedTemplate && templateSelector.querySelector('[data-template="summary"]')) {
        templateSelector.querySelector('[data-template="summary"]').classList.add('selected');
        selectedTemplate = 'summary';
    }
}

},{"@supabase/supabase-js":"gKVA2","./export/report-generation.js":"UkKb3"}],"UkKb3":[function(require,module,exports,__globalThis) {
// docs/js/dashboard/export/report-generation.js
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// Removed: waitUntilHandlebarsIsReady, no longer needed with Parcel bundling
parcelHelpers.export(exports, "fetchTemplate", ()=>fetchTemplate);
parcelHelpers.export(exports, "prepareReportData", ()=>prepareReportData);
var _supabaseJs = require("@supabase/supabase-js");
var _handlebars = require("handlebars");
var _handlebarsDefault = parcelHelpers.interopDefault(_handlebars);
var _jspdf = require("jspdf");
var _html2Canvas = require("html2canvas");
var _html2CanvasDefault = parcelHelpers.interopDefault(_html2Canvas);
var _qrcode = require("qrcode"); // Using the 'qrcode' package
var _qrcodeDefault = parcelHelpers.interopDefault(_qrcode);
var _lucide = require("lucide");
var _templatesJs = require("./templates.js");
// Supabase Client (might be imported from a shared API module later)
const SUPABASE_URL = 'https://lgybmsziqjdmmxdiyils.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneWJtc3ppcWpkbW14ZGl5aWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTAzOTcsImV4cCI6MjA2NjI4NjM5N30.GFqiwK2qi3TnlUDCmdFZpG69pqdPP-jpbxdUGX6VlSg';
const supabase = (0, _supabaseJs.createClient)(SUPABASE_URL, SUPABASE_ANON_KEY);
async function fetchTemplate(templateName) {
    // Instead of fetching, directly return the template string from the imported templates
    let templateString;
    switch(templateName){
        case 'base':
            templateString = (0, _templatesJs.baseTemplate);
            break;
        case 'summary-section':
            templateString = (0, _templatesJs.summarySectionTemplate);
            break;
        case 'detailed-breakdown-section':
            templateString = (0, _templatesJs.detailedBreakdownSectionTemplate);
            break;
        case 'recommendations-section':
            templateString = (0, _templatesJs.recommendationsSectionTemplate);
            break;
        case 'comparison-table-section':
            templateString = (0, _templatesJs.comparisonTableSectionTemplate);
            break;
        case 'compliance-section':
            templateString = (0, _templatesJs.complianceSectionTemplate);
            break;
        case 'premium-features-section':
            templateString = (0, _templatesJs.premiumFeaturesTemplate);
            break;
        default:
            throw new Error(`Unknown template: ${templateName}`);
    }
    console.log(`fetchTemplate(): Using embedded template string for ${templateName}:`, templateString.substring(0, 200) + '...'); // Log first 200 chars
    return (0, _handlebarsDefault.default).compile(templateString);
}
// Data preparation for Handlebars templates
function prepareTemplateData(primaryAssessment, selectedData, sectionsToGenerate) {
    const summaryText = primaryAssessment.summary_and_recommendation || primaryAssessment.detailedAssessment?.summary_and_recommendation || 'No description provided.';
    const recommendations = primaryAssessment.recommendations || [];
    return {
        primaryAssessment: primaryAssessment,
        allSelectedData: selectedData,
        sectionsToGenerate: sectionsToGenerate,
        reportDate: new Date().toLocaleDateString(),
        assessmentIdShort: primaryAssessment.id ? primaryAssessment.id.substring(0, 8) : 'N/A',
        toolName: primaryAssessment.name || 'N/A',
        toolSubtitle: primaryAssessment.vendor || 'N/A',
        overallScore: primaryAssessment.total_score || '0',
        maxScore: '100',
        riskLevel: primaryAssessment.risk_level || 'N/A',
        riskLevelLower: (primaryAssessment.risk_level || 'N/A').toLowerCase().replace(' ', '-'),
        riskDescription: summaryText,
        keyStrengths: recommendations.filter((rec)=>rec?.category === 'strength').map((rec)=>rec?.description).filter(Boolean).join(' ') || 'No key strengths identified.',
        areasForImprovement: recommendations.filter((rec)=>rec?.category && rec.category !== 'strength').map((rec)=>rec?.description).filter(Boolean).join(' ') || 'No areas for improvement identified.',
        findings: summaryText.split(/[.!?]+/).filter((f)=>f.trim().length > 10).map((f, i)=>({
                text: f.trim(),
                index: i + 1
            })),
        detailedAssessmentDetails: primaryAssessment.detailedAssessment?.assessment_details ? Object.entries(primaryAssessment.detailedAssessment.assessment_details).map(([key, value])=>({
                key: key,
                displayName: key.replace(/_/g, ' ').split(' ').map((word)=>word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                category_score: value.category_score || value.score || '0',
                risk_level: (value.final_risk_category || value.risk_level || primaryAssessment.risk_level || 'medium').toLowerCase().replace(/\s+/g, '-'),
                description: value.summary_and_recommendation || value.summary || value.description || 'No description provided.',
                criteria: value.criteria ? Object.entries(value.criteria).map(([critKey, critValue])=>({
                        key: critKey,
                        score: critValue.score || '0',
                        justification: critValue.justification || 'No justification provided.'
                    })) : []
            })) : [],
        recommendationsList: recommendations,
        comparisonData: selectedData.length > 1 ? selectedData.map((assessment)=>({
                name: assessment.name || 'Unnamed Assessment',
                total_score: assessment.total_score || '0',
                risk_level: (assessment.risk_level || 'N/A').toLowerCase().replace(/\s+/g, '-')
            })) : []
    };
}
async function prepareReportData(selectedAssessmentIds, allAssessments, quickTemplates, selectedTemplate, currentMode, customSelectedSections, selectedTheme) {
    if (selectedAssessmentIds.size === 0 || currentMode === 'template' && !selectedTemplate || currentMode === 'custom' && customSelectedSections.size === 0) {
        alert('Please select at least one assessment and either a quick template or custom sections.');
        return;
    }
    const previewReportBtn = document.getElementById('previewReportBtn');
    previewReportBtn.disabled = true;
    previewReportBtn.innerHTML = '<i class="loader"></i> Generating...';
    try {
        const selectedData = allAssessments.filter((a)=>selectedAssessmentIds.has(a.id));
        const primaryAssessment = selectedData[0];
        let sectionsToGenerate = [];
        if (currentMode === 'template' && selectedTemplate) sectionsToGenerate = quickTemplates[selectedTemplate].sections;
        else if (currentMode === 'custom') sectionsToGenerate = Array.from(customSelectedSections);
        // Store data in sessionStorage to pass to the preview page
        const reportData = {
            primaryAssessment,
            selectedData,
            sectionsToGenerate,
            selectedTemplate,
            selectedTheme
        };
        sessionStorage.setItem('reportData', JSON.stringify(reportData));
        // Open the preview page in a new tab
        window.open('report-preview.html', '_blank');
    } catch (error) {
        console.error('Error preparing report data:', error);
        alert('Failed to prepare report data. Please check the console for details.');
    } finally{
        previewReportBtn.disabled = false;
        previewReportBtn.innerHTML = '<i data-lucide="eye" class="w-5 h-5 mr-2"></i><span>Preview Report</span>';
        (0, _lucide.createIcons)({
            icons: (0, _lucide.icons)
        });
    }
}

},{"@supabase/supabase-js":"gKVA2","handlebars":"9pFby","jspdf":"b6g54","html2canvas":"jgq02","qrcode":"9Qtts","lucide":"hPBbM","./templates.js":"9q6Gb","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"jnFvT":[function(require,module,exports,__globalThis) {
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

},{}]},["i40gp","4IY3I"], "4IY3I", "parcelRequire4b35", {})

//# sourceMappingURL=export.85d8833b.js.map
