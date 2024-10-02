import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Image, FlatList, Pressable, Modal, Text } from "react-native";
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
    const [modalVisible, setModalVisible] = useState(false);

    // ========================================
    // Save changes to note
    // and opload text and image to Firestore
    // ========================================
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

    // ========================================
    // Handle image upload locally (for preview)
    // ========================================

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

    // Function to open the camera and take a picture
    const handleOpenCamera = async () => {
        // Request permission to access the camera
        let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
            alert("Permission to access camera is required!");
            return;
        }

        // Launch camera and take a picture
        let pickerResult = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        // If the user didn't cancel the camera, set the imageUri
        if (!pickerResult.canceled) {
            setImageUri(pickerResult.assets[0].uri);
        }
    };

    // ========================================
    // Browse images from Firebase Storage
    // ========================================

    // Function to browse images from Firebase Storage
    const browseImagesFromFirebase = async () => {
        try {
            const listRef = ref(storage, "images/");
            const res = await listAll(listRef);
            const imageUrls = await Promise.all(
                res.items.map(async (itemRef) => {
                    const url = await getDownloadURL(itemRef);
                    return url;
                })
            );
            setDownloadedImageUri(imageUrls); // Save fetched images in state
            setModalVisible(true); // Show modal with images
        } catch (error) {
            console.error("Error fetching images: ", error);
        }
    };

    // ========================================
    // Render the component
    // ========================================

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} value={text} onChangeText={setText} multiline />
            <Button title={uploading ? "Saving..." : "Save changes"} onPress={saveNote} disabled={uploading} />

            {/* Button to upload an image locally */}
            <Button title="Select Image from device" onPress={handleImageUpload} />

            {/* Button to open the camera */}
            <Button title="Take a Picture" onPress={handleOpenCamera} />

            {/* Button to fetch image from Firebase Storage */}
            <Button title="Browse Images from firebase" onPress={browseImagesFromFirebase} />

            {/* Display the selected image */}
            {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

            {/* Modal to show images from Firebase Storage */}
            <Modal
                animationType="fade" // Quicker fade animation
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)} // Close modal when the back button is pressed
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Select an Image</Text>
                        <FlatList
                            data={downloadedImageUri}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => {
                                        setImageUri(item); // Set the selected image
                                        setModalVisible(false); // Close the modal
                                    }}
                                >
                                    <Image source={{ uri: item }} style={styles.imageThumbnail} />
                                </Pressable>
                            )}
                            numColumns={3} // Display images in grid
                        />
                        <Button title="Close" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// ========================================
// Styles
// ========================================

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
    imageThumbnail: {
        width: 100,
        height: 100,
        margin: 5,
        borderRadius: 10, // Rounded corners for images
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)", // Darker overlay
    },
    modalView: {
        width: "90%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5, // Adds a shadow effect for Android
    },
    modalText: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "black",
    },
});
