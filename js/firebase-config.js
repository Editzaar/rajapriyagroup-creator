/* =========================================================
   RAJA PRIYA GROUP — FIREBASE CONFIGURATION
   ========================================================= */
(function (global) {
  'use strict';

  const firebaseConfig = {
    apiKey: "AIzaSyADkOAEvhbsyZ4bLcBfR2Cn_P_OmduXA0Q",
    authDomain: "rajapriyagroup-dfe42.firebaseapp.com",
    projectId: "rajapriyagroup-dfe42",
    storageBucket: "rajapriyagroup-dfe42.firebasestorage.app",
    messagingSenderId: "840696583163",
    appId: "1:840696583163:web:54ad04207d238fb47f715e",
    measurementId: "G-09048F2LMM"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  // Expose db globally
  global.db = db;

})(window);
