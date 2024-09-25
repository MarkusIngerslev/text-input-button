import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Image } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { database } from "./firebase";
import * as ImagePicker from "expo-image-picker";

export default function NoteDetail({ route, navigation }) {
    const { note, notes, setNotes } = route.params;
    const [text, setText] = useState(note.text);
    const [imageUri, setImageUri] = useState(null); // State for the image

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

    // Function to handle image upload
    const handleImageUpload = async () => {
        // Request permission to access media library
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

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} value={text} onChangeText={setText} multiline />
            <Button title="Save" onPress={saveNote} />

            {/* Button to upload an image */}
            <Button title="Upload Image" onPress={handleImageUpload} />

            {/* Display the selected image */}
            {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
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
