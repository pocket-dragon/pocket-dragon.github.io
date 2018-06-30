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

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.3.0/workbox-sw.js");

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
    "revision": "540d8306035a3975ccdf39701723f128"
  },
  {
    "url": "build/app/app.eeqcbigw.js",
    "revision": "04dfbd38f3ff4f9444deda54681fef41"
  },
  {
    "url": "build/app/app.iqjpnrrj.js",
    "revision": "12eed75e3519e4955ea666c2f7f0ef7b"
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
    "url": "build/app/loettoy3.es5.js",
    "revision": "341012f0e5919e03a63ef7878f559096"
  },
  {
    "url": "build/app/loettoy3.js",
    "revision": "b9c0b704c6a7571852e1884c41388781"
  },
  {
    "url": "build/app/nz2fdln1.es5.js",
    "revision": "5d69c2d68e1b6311e8813ad19899b899"
  },
  {
    "url": "build/app/nz2fdln1.js",
    "revision": "e8c9399d19d7d2bac1e00da1fa5a4d68"
  },
  {
    "url": "build/app/xevjnbnz.es5.js",
    "revision": "e04e789374189c599c5efe98c968f899"
  },
  {
    "url": "build/app/xevjnbnz.js",
    "revision": "9d1e2524192d1d422d5862a919aa43e6"
  },
  {
    "url": "index.html",
    "revision": "190c15f1c2f13919a5a877f275880e4d"
  },
  {
    "url": "manifest.json",
    "revision": "b2610260ffcedd21691ce9dc79285100"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
