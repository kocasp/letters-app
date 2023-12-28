import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import db from './firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

const GameScreen = ({ route }) => {
    const [roomData, setRoomData] = useState(null);
    const [letter, setLetter] = useState('');
    const { gameData } = route.params;

    useEffect(() => {
        const docRef = doc(db, "rooms", gameData.id);

        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                setRoomData(doc.data());
            } else {
                console.log("No such document!");
            }
        }, (error) => {
            console.error("Error getting document:", error);
        });

        return unsubscribe; // Cleanup function to unsubscribe when the component unmounts
    }, [gameData.id]);

    const submitLetter = async (side) => {
        try {
            const queryParams = new URLSearchParams({
                roomName: gameData.id,
                playerHash: gameData.your_player_hash, // Replace with actual playerHash
                letter: letter,
                side: side,
            }).toString();

            const url = `https://us-central1-letters-9e7e6.cloudfunctions.net/addLetter?${queryParams}`;
            const response = await fetch(url);
            // const responseData = await response.json();
            // console.log(response);
        } catch (error) {
            console.error("Error submitting letter:", error);
        }
    };

    if (!roomData) return <Text>Loading...</Text>;

    return (
        <View style={styles.container}>
            <Text>room: {gameData.id}</Text>
            <Text>{JSON.stringify(roomData, null, 4)}</Text>
            <Text>your player: {gameData.your_player_hash}</Text>
            <TextInput
                style={styles.input}
                value={letter}
                onChangeText={setLetter}
                placeholder="Enter a letter"
                maxLength={1}
            />
            <Button title="LEFT" onPress={() => submitLetter('left')} />
            <Button title="RIGHT" onPress={() => submitLetter('right')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        margin: 10,
        width: '80%',
    },
});

export default GameScreen;
