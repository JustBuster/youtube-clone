// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAb26tRoDBGmT6vsdSXEaJ0LO5FMMVF9o",
  authDomain: "yt-clone-843fd.firebaseapp.com",
  projectId: "yt-clone-843fd",
  appId: "1:656808156832:web:66502b0f1205b41fabf3c5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

/**
 * Signs the user in with a Google popup.
 */
export function signInWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

/**
 * Signs the user out.
 */
export function signOut() {
  return auth.signOut();
}

/**
 * Trigger a callback when user auth state changes.
 * @returns A function to unsubscribe callback.
 */
export function onAuthStateChangedHelper(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// The code below is from functions.ts

import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();

const generateUploadURLFunction = httpsCallable(functions, 'generateUploadURL');

export async function uploadVideo(file: File) {

    const response: any = await generateUploadURLFunction({
        fileExtension: file.name.split(".").pop
    })

    // Upload the file via the signed URL
    const uploadResult = await fetch(response?.data?.url, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type
        },
    });

    return uploadResult;
}