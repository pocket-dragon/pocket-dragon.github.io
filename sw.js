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
    "url": "assets/font/stylesheet.css",
    "revision": "96a83fb85f2eca38fb132d17b9a9063f"
  },
  {
    "url": "assets/icon/android-icon-144x144.png",
    "revision": "424315f40ebae1d3d219bfa0ec5bc20b"
  },
  {
    "url": "assets/icon/android-icon-192x192.png",
    "revision": "250e64b10a381531cfc4f0afc4e65bb2"
  },
  {
    "url": "assets/icon/android-icon-36x36.png",
    "revision": "34666fbf7405f0b336d1af18249e7ddb"
  },
  {
    "url": "assets/icon/android-icon-48x48.png",
    "revision": "6d941415e247399c7004cb0ead9c6d1c"
  },
  {
    "url": "assets/icon/android-icon-72x72.png",
    "revision": "8067751c64a9a9497c153f7aed310ee1"
  },
  {
    "url": "assets/icon/android-icon-96x96.png",
    "revision": "15554d676d5e992b0b4945a8eda2ba8a"
  },
  {
    "url": "assets/icon/apple-icon-114x114.png",
    "revision": "0dacb2b4e204c21c5c73c52abd6c961f"
  },
  {
    "url": "assets/icon/apple-icon-120x120.png",
    "revision": "886f0727185cb638ba9b0f15f1187bd6"
  },
  {
    "url": "assets/icon/apple-icon-144x144.png",
    "revision": "424315f40ebae1d3d219bfa0ec5bc20b"
  },
  {
    "url": "assets/icon/apple-icon-152x152.png",
    "revision": "e2cb6c74910f734cf94a6447bd6fef9e"
  },
  {
    "url": "assets/icon/apple-icon-180x180.png",
    "revision": "ffc90e246c0715a5fb7301697efbf8b4"
  },
  {
    "url": "assets/icon/apple-icon-57x57.png",
    "revision": "9137a33c36c542cb2192d8e00760faf3"
  },
  {
    "url": "assets/icon/apple-icon-60x60.png",
    "revision": "4d4ab2cf17955dcced747e072376db69"
  },
  {
    "url": "assets/icon/apple-icon-72x72.png",
    "revision": "8067751c64a9a9497c153f7aed310ee1"
  },
  {
    "url": "assets/icon/apple-icon-76x76.png",
    "revision": "55566b9dfce4d1b7a1d5126330917267"
  },
  {
    "url": "assets/icon/apple-icon-precomposed.png",
    "revision": "19272fb9f99f658dc0d93c611f0b57ec"
  },
  {
    "url": "assets/icon/apple-icon.png",
    "revision": "19272fb9f99f658dc0d93c611f0b57ec"
  },
  {
    "url": "assets/icon/favicon-16x16.png",
    "revision": "e861de71048dceff30c3f50ce1bb4cde"
  },
  {
    "url": "assets/icon/favicon-32x32.png",
    "revision": "02de202471209e7b53be99bfac52497c"
  },
  {
    "url": "assets/icon/favicon-96x96.png",
    "revision": "15554d676d5e992b0b4945a8eda2ba8a"
  },
  {
    "url": "assets/icon/favicon.ico",
    "revision": "bae2fc18db813edaa0c0ec380725d29b"
  },
  {
    "url": "assets/icon/icon-source.png",
    "revision": "014eed0c0892d063399ceee3c7d076ac"
  },
  {
    "url": "assets/icon/ms-icon-144x144.png",
    "revision": "424315f40ebae1d3d219bfa0ec5bc20b"
  },
  {
    "url": "assets/icon/ms-icon-150x150.png",
    "revision": "195a98b7c56992404b521099c2b6e971"
  },
  {
    "url": "assets/icon/ms-icon-310x310.png",
    "revision": "5a27528826944da29a0ba18e81522997"
  },
  {
    "url": "assets/icon/ms-icon-70x70.png",
    "revision": "b2be6f0a6f043b34c3e484705c34222a"
  },
  {
    "url": "build/app.css",
    "revision": "3d69bde6de95a7903b8d8124a94aa23a"
  },
  {
    "url": "build/app.js",
    "revision": "e8d8236072c6fb0344dc9596bd80cb88"
  },
  {
    "url": "build/app/8ltd2as4.es5.js",
    "revision": "e7971bad7e8ddc966cccf7472c475351"
  },
  {
    "url": "build/app/8ltd2as4.js",
    "revision": "16a265812c66c366b81d29a6dd896782"
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
    "url": "index.html",
    "revision": "ad8f95a20c0e33e5f0f31c246fd2f6c0"
  },
  {
    "url": "manifest.json",
    "revision": "e097474e636adf0f9c1af0d596c84098"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
