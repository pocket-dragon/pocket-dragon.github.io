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
    "revision": "51613016de37de7b8eede1c00dd75ba9"
  },
  {
    "url": "build/app/app.apmbfxfl.js",
    "revision": "2fdf3d17e15a7d6cf7c34e199fabe0bc"
  },
  {
    "url": "build/app/app.eeqcbigw.js",
    "revision": "04dfbd38f3ff4f9444deda54681fef41"
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
    "url": "build/app/w8fkr4ps.es5.js",
    "revision": "3cc6e61a6372b0872d9e0000f9e64ffe"
  },
  {
    "url": "build/app/w8fkr4ps.js",
    "revision": "967681475c593087a92e5eb4402bfd7d"
  },
  {
    "url": "index.html",
    "revision": "649f4023e34b9dcdfcc896f396c9c7be"
  },
  {
    "url": "manifest.json",
    "revision": "0c129721ede7cd25304ebdd238d774ad"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
