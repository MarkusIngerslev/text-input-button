// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB83HEgbQbfQQS1HMWspUPVSYQq3Ov7o8M",
    authDomain: "notebookv2-b504e.firebaseapp.com",
    projectId: "notebookv2-b504e",
    storageBucket: "notebookv2-b504e.appspot.com",
    messagingSenderId: "205280362284",
    appId: "1:205280362284:web:fe596dca73a80862903689",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app);
const storage = getStorage(app);

export { app, database, storage };
