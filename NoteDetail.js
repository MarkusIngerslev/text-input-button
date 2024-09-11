import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";

export default function NoteDetail({ route, navigation }) {
    const { note, notes, setNotes, saveNotes } = route.params;
    const [text, setText] = useState(note.text);

    const saveNote = () => {
        const updatedNotes = notes.map((n) => (n.id === note.id ? { ...n, text } : n));
        setNotes(updatedNotes);
        saveNotes(updatedNotes); // Save updated notes to AsyncStorage
        navigation.goBack();
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
        height: 150,
        borderColor: "gray",
        borderWidth: 1,
        padding: 10,
    },
});
