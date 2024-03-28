// This a service worker file for receiving push notifitications.
// See `Access registration token section` @ https://firebase.google.com/docs/cloud-messaging/js/client#retrieve-the-current-registration-token

// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');


// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
    apiKey: "AIzaSyBV957x7cSw8e7MjFcmiiZHB6b5-TIo4NE",
    authDomain: "pwa-pushnotification-450a8.firebaseapp.com",
    projectId: "pwa-pushnotification-450a8",
    storageBucket: "pwa-pushnotification-450a8.appspot.com",
    messagingSenderId: "232212574458",
    appId: "1:232212574458:web:d8a2a7063928f7c2071943",
    measurementId: "G-MZXWF3168K"
  };


firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

// Handle incoming messages while the app is not in focus (i.e in the background, hidden behind other tabs, or completely closed).
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);

});