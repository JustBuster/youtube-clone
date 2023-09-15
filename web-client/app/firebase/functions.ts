// Dont know why getFunctions is throwing a init firebase error when its intialized in firebase.ts so shifting all the code to firebase.ts

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
