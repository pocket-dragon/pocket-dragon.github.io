/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.3.1/workbox-sw.js");

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "assets/icon/favicon.ico",
    "revision": "d2f619d796fbe8bed6200da2691aa5b6"
  },
  {
    "url": "assets/icon/icon.png",
    "revision": "b96ad6e1e0b755c8cd45e6aec40bca25"
  },
  {
    "url": "build/app.css",
    "revision": "0c5dad92482d9a7c7c253510f5082465"
  },
  {
    "url": "build/app.js",
    "revision": "d1831babb3844d95d5c76bc7ad24bf48"
  },
  {
    "url": "build/app/app.67lcqu4c.js",
    "revision": "53cf0141a6764fdda3a6a4285d3678fd"
  },
  {
    "url": "build/app/app.noxf69c3.js",
    "revision": "c881f2f548c91b9dd9e1ca6069971fb4"
  },
  {
    "url": "build/app/chunk-c1d9906c.es5.js",
    "revision": "4afa60e35b97922216fd8889cd1b0551"
  },
  {
    "url": "build/app/chunk-d3ec1289.js",
    "revision": "10703c0924f6e1cad4eb1736c35318b3"
  },
  {
    "url": "build/app/dgid3v0b.es5.js",
    "revision": "5ccfc9461875c711936d6d45e73d9575"
  },
  {
    "url": "build/app/dgid3v0b.js",
    "revision": "50d8002820e23e714c43b1c89d4a4fed"
  },
  {
    "url": "build/app/loettoy3.es5.js",
    "revision": "341012f0e5919e03a63ef7878f559096"
  },
  {
    "url": "build/app/loettoy3.js",
    "revision": "b9c0b704c6a7571852e1884c41388781"
  },
  {
    "url": "build/app/p00b6sty.es5.js",
    "revision": "d0c0e6a6227e96453cff38369d7737a8"
  },
  {
    "url": "build/app/p00b6sty.js",
    "revision": "0870ed1a2066888c7666c14d8febb98f"
  },
  {
    "url": "index.html",
    "revision": "09989326cd2b16451b92a59d9381d578"
  },
  {
    "url": "manifest.json",
    "revision": "0c129721ede7cd25304ebdd238d774ad"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
