import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { database } from "./firebase";

export default function NoteDetail({ route, navigation }) {
    const { note, notes, setNotes } = route.params;
    const [text, setText] = useState(note.text);

    const saveNote = async () => {
        try {
            const noteRef = doc(database, "notes", note.id);
            await updateDoc(noteRef, {
                text: text,
            });

            // Opdater lokalt
            const updatedNotes = notes.map((n) => (n.id === note.id ? { ...n, text } : n));
            setNotes(updatedNotes);
            navigation.goBack();
        } catch (error) {
            console.error("Failed to update note in Firestore.", error);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} value={text} onChangeText={setText} multiline />
            <Button title="Save" onPress={saveNote} />
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
});
