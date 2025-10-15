  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
   
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  // Initialize other Firebase services and export them for use in pages
  import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

  export const auth = getAuth(app);
  export const db = getFirestore(app);

