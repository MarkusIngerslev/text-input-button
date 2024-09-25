import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Image } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { database } from "./firebase";
import { launchImageLibrary } from "react-native-image-picker";

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
    const handleImageUpload = () => {
        launchImageLibrary({}, (response) => {
            if (response.didCancel) {
                console.log("User cancelled image picker");
            } else if (response.errorMessage) {
                console.log("Image Picker Error: ", response.errorMessage);
            } else {
                const uri = response.assets[0].uri;
                setImageUri(uri); // Set the image URI to state
            }
        });
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
