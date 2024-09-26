import React, { useState, useEffect } from "react";
import { Modal, View, Text, Image, TouchableOpacity, ScrollView, Button, StyleSheet } from "react-native";
import { listAll, ref, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export default function ImageBrowser({ visible, onClose, onSelectImage }) {
    const [availableImages, setAvailableImages] = useState([]);

    useEffect(() => {
        const fetchImagesFromFirebase = async () => {
            const imagesRef = ref(storage, "images/");
            try {
                const result = await listAll(imagesRef);
                const imageUrls = await Promise.all(
                    result.items.map(async (itemRef) => {
                        const url = await getDownloadURL(itemRef);
                        return { name: itemRef.name, url };
                    })
                );
                setAvailableImages(imageUrls);
            } catch (error) {
                console.error("Error fetching images: ", error);
            }
        };

        if (visible) {
            fetchImagesFromFirebase(); // Fetch images when modal becomes visible
        }
    }, [visible]);

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Select an Image</Text>
                    <ScrollView horizontal>
                        {availableImages.map((image) => (
                            <TouchableOpacity key={image.name} onPress={() => onSelectImage(image.url)}>
                                <Image source={{ uri: image.url }} style={styles.thumbnail} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <Button title="Close" onPress={onClose} />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        width: "90%",
        maxHeight: "80%",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    thumbnail: {
        width: 100,
        height: 100,
        marginRight: 10,
    },
});
