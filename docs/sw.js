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
    "revision": "a5ac4f66b4a91a6f6c7a075a04b8d88f"
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
    "url": "build/app/cz9tggv8.es5.js",
    "revision": "fb7532b28decf8557fb0b51f20b322c9"
  },
  {
    "url": "build/app/cz9tggv8.js",
    "revision": "c015990912a37d15a2eb6ce118350959"
  },
  {
    "url": "index.html",
    "revision": "f25852a58de846ee5714f3bc7dbc8a45"
  },
  {
    "url": "manifest.json",
    "revision": "b2610260ffcedd21691ce9dc79285100"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
