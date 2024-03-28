// Firebase Cloud Messaging Configuration File.
// Read more at https://firebase.google.com/docs/cloud-messaging/js/client && https://firebase.google.com/docs/cloud-messaging/js/receive

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyBV957x7cSw8e7MjFcmiiZHB6b5-TIo4NE",
    authDomain: "pwa-pushnotification-450a8.firebaseapp.com",
    projectId: "pwa-pushnotification-450a8",
    storageBucket: "pwa-pushnotification-450a8.appspot.com",
    messagingSenderId: "232212574458",
    appId: "1:232212574458:web:d8a2a7063928f7c2071943",
    measurementId: "G-MZXWF3168K"
  };

initializeApp(firebaseConfig);

const messaging = getMessaging();

export  async function  requestForToken() {
    // The method getToken(): Promise<string> allows FCM to use the VAPID key credential
    // when sending message requests to different push services
    return getToken(messaging, { vapidKey: `BA7bL3UsoKTWbCNjBWO1uqGG3FbLv2o3fjk-k5tszkH0_29MMLGFnk3JOHphX_VkEhCQ_la1pYnNnmO_7HyB9ns` }) //to authorize send requests to supported web push services
        .then((currentToken) => {
            if (currentToken) {
                console.log('current token for client: ', currentToken);

                if(localStorage.getItem('fcmToken') && currentToken !==localStorage.getItem('fcmToken')){
                    localStorage.setItem('fcmToken', currentToken);

                }

                else if(!localStorage.getItem('fcmToken')){
                    localStorage.setItem('fcmToken', currentToken);

                }


            } else {
                console.log('No registration token available. Request permission to generate one.');
            }
        })
        .catch((err) => {
            console.log('An error occurred while retrieving token. ', err);
        });
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });