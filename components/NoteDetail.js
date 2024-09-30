import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Image } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { database, storage } from "./firebase";
import * as ImagePicker from "expo-image-picker";

export default function NoteDetail({ route, navigation }) {
    const { note, notes, setNotes } = route.params;
    const [text, setText] = useState(note.text);
    const [imageUri, setImageUri] = useState(null); // State for the selected image
    const [downloadedImageUri, setDownloadedImageUri] = useState(null); // State for the downloaded image
    const [uploading, setUploading] = useState(false);

    const saveNote = async () => {
        try {
            const noteRef = doc(database, "notes", note.id);
            await updateDoc(noteRef, {
                text: text,
            });

            // Update locally
            const updatedNotes = notes.map((n) => (n.id === note.id ? { ...n, text } : n));
            setNotes(updatedNotes);
            navigation.goBack();
        } catch (error) {
            console.error("Failed to update note in Firestore.", error);
        }
    };

    // Function to handle image upload locally (for preview)
    const handleImageUpload = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            alert("Permission to access camera roll is required!");
            return;
        }

        let pickerResult = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!pickerResult.canceled) {
            setImageUri(pickerResult.assets[0].uri); // Set the selected image URI
        }
    };

    // Function to upload the image to Firebase Storage
    const uploadImageToFirebase = async () => {
        if (!imageUri) {
            alert("Please select an image first");
            return;
        }

        try {
            setUploading(true);
            const response = await fetch(imageUri);
            const blob = await response.blob();

            // Create a reference to the Firebase Storage location
            const filename = imageUri.substring(imageUri.lastIndexOf("/") + 1);
            const storageRef = ref(storage, `images/${filename}`);

            // Upload the image to Firebase Storage
            await uploadBytes(storageRef, blob);
            alert("Image uploaded successfully!");

            // Optional: You can also get the download URL if needed
            const downloadUrl = await getDownloadURL(storageRef);
            console.log("Download URL: ", downloadUrl);

            setUploading(false);
        } catch (error) {
            console.error("Error uploading image: ", error);
            setUploading(false);
        }
    };

    // Function to fetch the image from Firebase Storage
    const fetchImageFromFirebase = async () => {
        try {
            // Reference to the location in Firebase Storage where the image is stored
            // Update this to match the filename or path of the image you want to fetch
            const storageRef = ref(storage, `images/Ks1YUCcXtAAAAAElFTkSuQmCC`);

            // Get the download URL for the image
            const url = await getDownloadURL(storageRef);
            setDownloadedImageUri(url); // Set the downloaded image URI

            alert("Image fetched successfully!");
        } catch (error) {
            console.error("Error fetching image: ", error);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} value={text} onChangeText={setText} multiline />
            <Button title="Save" onPress={saveNote} />

            {/* Button to upload an image locally */}
            <Button title="Select Image" onPress={handleImageUpload} />

            {/* Button to upload image to Firebase Storage */}
            <Button
                title={uploading ? "Uploading..." : "Upload to Firebase"}
                onPress={uploadImageToFirebase}
                disabled={uploading}
            />

            {/* Button to fetch image from Firebase Storage */}
            <Button title="Fetch Image from Firebase" onPress={fetchImageFromFirebase} />

            {/* Display the selected image */}
            {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

            {/* Display the downloaded image */}
            {downloadedImageUri && <Image source={{ uri: downloadedImageUri }} style={styles.image} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    input: {
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 8,
    },
    image: {
        width: 200,
        height: 200,
        marginTop: 20,
    },
});
