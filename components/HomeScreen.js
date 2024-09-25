import React, { useState, useEffect } from "react";
import { database } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { View, TextInput, Text, Button, FlatList, Pressable, StyleSheet } from "react-native";

export default function HomeScreen({ navigation }) {
    const [text, setText] = useState("");
    const [notes, setNotes] = useState([]);

    // Hent noterne fra Firestore når appen starter
    useEffect(() => {
        loadNotes();
    }, []);

    // Hent alle noter fra Firestore
    const loadNotes = async () => {
        try {
            const querySnapshot = await getDocs(collection(database, "notes"));
            const fetchedNotes = [];
            querySnapshot.forEach((doc) => {
                fetchedNotes.push({ ...doc.data(), id: doc.id, imageUri: doc.data().imageUri || null });
            });
            setNotes(fetchedNotes);
        } catch (error) {
            console.error("Failed to load notes from Firestore.", error);
        }
    };

    // Tilføj en ny note til Firestore
    const addNote = async () => {
        if (text.length > 0) {
            try {
                const docRef = await addDoc(collection(database, "notes"), {
                    text: text,
                });
                setNotes([...notes, { id: docRef.id, text }]);
                setText(""); // Nulstil tekstinput
            } catch (err) {
                console.log("Fejl i DB: " + err);
            }
        }
    };

    // Fjern en note fra Firestore
    const removeNote = async (id) => {
        try {
            await deleteDoc(doc(database, "notes", id));
            const newNotes = notes.filter((note) => note.id !== id);
            setNotes(newNotes);
        } catch (error) {
            console.error("Failed to delete note from Firestore.", error);
        }
    };

    const handleNotePress = (id) => {
        const selectedNote = notes.find((note) => note.id === id);
        navigation.navigate("NoteDetail", { note: selectedNote, notes, setNotes });
    };

    const renderNote = ({ item }) => {
        const shortText = item.text.length > 25 ? item.text.slice(0, 25) + "..." : item.text;
        return (
            <Pressable onPress={() => handleNotePress(item.id)}>
                <View style={styles.noteContainer}>
                    <Text style={styles.note}>{shortText}</Text>
                    <Pressable onPress={() => removeNote(item.id)}>
                        <Text style={styles.deleteButton}>X</Text>
                    </Pressable>
                </View>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Notes</Text>
            <TextInput style={styles.input} placeholder="Enter a note..." value={text} onChangeText={setText} />
            <Button title="Add Note" onPress={addNote} />
            <FlatList
                data={notes}
                renderItem={renderNote}
                keyExtractor={(item) => item.id}
                style={styles.notesContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 8,
    },
    notesContainer: {
        marginTop: 20,
    },
    noteContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    note: {
        fontSize: 18,
    },
    deleteButton: {
        color: "red",
        fontSize: 18,
    },
});
