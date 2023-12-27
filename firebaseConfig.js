// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDOm7tZdkAfoZ7ZNIMojWlnCqCFWvaL41w",
    authDomain: "letters-9e7e6.firebaseapp.com",
    projectId: "letters-9e7e6",
    storageBucket: "letters-9e7e6.appspot.com",
    messagingSenderId: "874261172895",
    appId: "1:874261172895:web:c8401356c488579ae548aa",
    measurementId: "G-BT9YFETFNJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
