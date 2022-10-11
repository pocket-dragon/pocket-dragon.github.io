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

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "index.html",
    "revision": "c1ce6b29110d1ce265c39633d59d5d7a"
  },
  {
    "url": "assets/font/stylesheet.css",
    "revision": "5c41e6a384c9f31713297844428233c9"
  },
  {
    "url": "build/index.esm.js",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "build/p-3b66a627.js"
  },
  {
    "url": "build/p-9356d36f.js"
  },
  {
    "url": "build/p-affe7c09.js"
  },
  {
    "url": "build/p-cu6i5pkc.css"
  },
  {
    "url": "build/p-d8631f0b.js"
  },
  {
    "url": "build/p-qol5lzw4.entry.js"
  },
  {
    "url": "build/p-wlbmmvn9.entry.js"
  },
  {
    "url": "manifest.json",
    "revision": "e097474e636adf0f9c1af0d596c84098"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
