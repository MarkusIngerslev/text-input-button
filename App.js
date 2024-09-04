import React, { useState } from "react";
import { View, TextInput, Button, Text, ScrollView, StyleSheet } from "react-native";

export default function App() {
    const [text, setText] = useState("");
    const [notes, setNotes] = useState([]);

    const addNote = () => {
        if (text.length > 0) {
            setNotes([...notes, text]);
            setText(""); // Clear TextInput after adding the note
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Notes</Text>
            <TextInput style={styles.input} placeholder="Enter a note..." value={text} onChangeText={setText} />
            <Button title="Add Note" onPress={addNote} />
            <ScrollView style={styles.notesContainer}>
                {notes.map((note, index) => (
                    <Text key={index} style={styles.note}>
                        {note}
                    </Text>
                ))}
            </ScrollView>
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
    note: {
        fontSize: 18,
        marginVertical: 5,
    },
});
