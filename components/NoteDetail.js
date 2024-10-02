import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Image } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import { database, storage } from "./firebase";
import * as ImagePicker from "expo-image-picker";

export default function NoteDetail({ route, navigation }) {
    const { note, notes, setNotes } = route.params;
    const [text, setText] = useState(note.text);
    const [imageUri, setImageUri] = useState(note.imageUri || null); // Load image URI if it exists
    const [downloadedImageUri, setDownloadedImageUri] = useState(null); // State for the downloaded image
    const [uploading, setUploading] = useState(false);

    const saveNote = async () => {
        try {
            setUploading(true);
            let imageUrl = imageUri;

            // Hvis der er valgt et billede, upload det først
            if (imageUri && !imageUri.startsWith("https://")) {
                // Tjekker om billedet allerede er uploadet
                const response = await fetch(imageUri);
                const blob = await response.blob();

                // Generér et unikt filnavn og reference til Firebase Storage
                const filename = `${new Date().getTime()}.jpg`; // Unikt filnavn
                const storageRef = ref(storage, `images/${filename}`);

                // Upload billedet
                await uploadBytes(storageRef, blob);

                // Hent download-URL'en fra Firebase Storage
                imageUrl = await getDownloadURL(storageRef);
                setImageUri(imageUrl); // Opdater billedets URL lokalt
            }

            // Gem noten i Firestore med det valgte billede (hvis det findes)
            const noteRef = doc(database, "notes", note.id);
            await updateDoc(noteRef, {
                text: text,
                imageUri: imageUrl, // Opdater note med billedets URL
            });

            // Opdater lokalt
            const updatedNotes = notes.map((n) => (n.id === note.id ? { ...n, text, imageUri: imageUrl } : n));
            setNotes(updatedNotes);

            alert("Note updated successfully!");
            setUploading(false);
            navigation.goBack();
        } catch (error) {
            console.error("Failed to update note in Firestore.", error);
            setUploading(false);
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
            setImageUri(pickerResult.assets[0].uri); // Set the selected image URI locally
        }
    };

    // Funktion til at browse billeder fra Firebase Storage
    const browseImagesFromFirebase = async () => {
        try {
            const listRef = ref(storage, "images/");
            const res = await listAll(listRef);
            const imageUrls = await Promise.all(
                res.items.map(async (itemRef) => {
                    const url = await getDownloadURL(itemRef);
                    return url; // Hent download-URL'en for hvert billede
                })
            );
            // Her kan du gemme imageUrls i state og vise dem i UI'et
            setDownloadedImageUri(imageUrls); // Gem billederne til visning
            alert("Fetched images from Firebase!");
        } catch (error) {
            console.error("Error fetching images: ", error);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} value={text} onChangeText={setText} multiline />
            <Button title={uploading ? "Saving..." : "Save Note"} onPress={saveNote} disabled={uploading} />

            {/* Button to upload an image locally */}
            <Button title="Select Image" onPress={handleImageUpload} />

            {/* Button to fetch image from Firebase Storage */}
            <Button title="Fetch Image from Firebase" onPress={browseImagesFromFirebase} />

            {/* Display the selected image */}
            {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

            {/* Render fetched images */}
            {downloadedImageUri && (
                <FlatList
                    data={downloadedImageUri}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <Pressable onPress={() => setImageUri(item)}>
                            {" "}
                            {/* Vælg billede */}
                            <Image source={{ uri: item }} style={styles.imageThumbnail} />
                        </Pressable>
                    )}
                    horizontal
                />
            )}
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
