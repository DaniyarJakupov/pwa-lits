// SW Registartion
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(registration => {})
    .catch(error => {
      console.log("Something went terribly wrong! 😬", error);
    });
}

// Prompt to add app to the HomeScreen
let promptEvent;
window.addEventListener("beforeinstallprompt", e => {
  // Don't show install prompt on a second visit
  e.preventDefault();
  // Store prompt event for the future
  promptEvent = e;
  return false;
});
