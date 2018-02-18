importScripts('./workbox-sw.dev.v2.1.2.js')
const staticAssets = [
    './',
    './index.html',
    './js/bundle.js',
    './manifest.json'
]

const wb = new WorkboxSW()

wb.precache(staticAssets)
wb.router.registerRoute('https://js.arcgis.com/4.5/esri/css/main.css', wb.strategies.networkFirst())
wb.router.registerRoute('https://fonts.googleapis.com/icon?family=Material+Icons', wb.strategies.networkFirst())
wb.router.registerRoute(/.*\.(png|jpg|jpeg|woff)/, wb.strategies.cacheFirst())
// wb.router.registerRoute('https://js.arcgis.com/4.6/(.*)', wb.strategies.networkFirst())