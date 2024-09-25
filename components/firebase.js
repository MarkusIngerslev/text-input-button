// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD6pacpBcmgXsat_SyJA1WkgUn2AkofV_E",
    authDomain: "notebook-f282b.firebaseapp.com",
    projectId: "notebook-f282b",
    storageBucket: "notebook-f282b.appspot.com",
    messagingSenderId: "174380221158",
    appId: "1:174380221158:web:d45caf8e08b6785434b127",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app);
const storage = getStorage(app);

export { app, database, storage };
