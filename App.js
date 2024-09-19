import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import NoteDetail from "./NoteDetail"; // Importér NoteDetail
import HomeScreen from "./HomeScreen"; // Importér HomeScreen

const Stack = createStackNavigator();

export default function App() {

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Notes" }} />
                <Stack.Screen name="NoteDetail" component={NoteDetail} options={{ title: "Note Detail" }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
