/* 1. 'INSTALL' EVENT LISTENER */
self.addEventListener("install", event => {
  console.log("Installed SW");
});
/* ===================================================== */
/* 2. 'ACTIVATE' EVENT LISTENER */
self.addEventListener("activate", event => {
  console.log("ACTIVATED SW!");
});
/* ===================================================== */
/* 3. FETCH EVENT LISTENER */
self.addEventListener("fetch", event => {});
