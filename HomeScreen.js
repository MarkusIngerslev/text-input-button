import React, { useState, useEffect } from "react";
import { View, TextInput, Text, Button, FlatList, Pressable, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen({ navigation }) {
    const [text, setText] = useState("");
    const [notes, setNotes] = useState([]);

    // hent noterne fra AsyncStorage når appen starter
    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        try {
            const savedNotes = await AsyncStorage.getItem("notes");
            if (savedNotes !== null) {
                setNotes(JSON.parse(savedNotes));
            }
        } catch (error) {
            console.error("Failed to load notes.", error);
        }
    };

    const saveNotes = async (newNotes) => {
        try {
            await AsyncStorage.setItem("notes", JSON.stringify(newNotes));
        } catch (error) {
            console.error("Failed to save notes.", error);
        }
    };

    const addNote = () => {
        if (text.length > 0) {
            const newNotes = [...notes, { id: Date.now().toString(), text }];
            setNotes(newNotes);
            setText("");
            saveNotes(newNotes); // Save notes to AsyncStorage
        }
    };

    const removeNote = (id) => {
        const newNotes = notes.filter((note) => note.id !== id);
        setNotes(newNotes);
        saveNotes(newNotes);
    };

    const handleNotePress = (id) => {
        const selectedNote = notes.find((note) => note.id === id);
        navigation.navigate("NoteDetail", { note: selectedNote, notes, setNotes, saveNotes });
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
