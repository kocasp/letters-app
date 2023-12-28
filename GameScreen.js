import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import db from './firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

const GameScreen = ({ route }) => {
    const [roomData, setRoomData] = useState(null);
    const [letter, setLetter] = useState('');
    const [explanation, setExplanation] = useState('');
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

        return unsubscribe;
    }, [gameData.id]);

    const submitLetter = async (side) => {
        try {
            const queryParams = new URLSearchParams({
                roomName: gameData.id,
                playerHash: gameData.your_player_hash,
                letter: letter,
                side: side,
            }).toString();

            const url = `https://us-central1-letters-9e7e6.cloudfunctions.net/addLetter?${queryParams}`;
            await fetch(url);
        } catch (error) {
            console.error("Error submitting letter:", error);
        }
    };

    const checkWord = async () => {
        try {
            const queryParams = new URLSearchParams({
                roomName: gameData.id,
                playerName: gameData.your_player_hash, // Replace with actual playerName if different
            }).toString();

            const url = `https://us-central1-letters-9e7e6.cloudfunctions.net/checkWord?${queryParams}`;
            const response = await fetch(url);
            const responseData = await response.json();
            console.log(responseData);
            // You can handle the response data as needed
        } catch (error) {
            console.error("Error checking word:", error);
        }
    };

    const submitExplanation = async () => {
        try {
            const queryParams = new URLSearchParams({
                roomName: gameData.id,
                playerName: gameData.your_player_hash, // Replace with actual playerName if different
                word: explanation,
            }).toString();

            const url = `https://us-central1-letters-9e7e6.cloudfunctions.net/explainWord?${queryParams}`;
            const response = await fetch(url);
            // const responseData = await response.json();
            // console.log(responseData);
            // Handle the response data as needed
        } catch (error) {
            console.error("Error submitting explanation:", error);
        }
    };

    if (!roomData) return <Text>Loading...</Text>;

    return (
        <View style={styles.container}>
            <Text>pokoj: {gameData.id}</Text>
            <Text style={styles.word}>{roomData.word}</Text>
            <TextInput
                style={styles.input}
                value={letter}
                onChangeText={setLetter}
                placeholder="Enter a letter"
                maxLength={1}
            />
            <Button title="LEWA" onPress={() => submitLetter('left')} />
            <Button title="PRAWA" onPress={() => submitLetter('right')} />
            <Button title="SPRAWDZ" onPress={checkWord} />
            <TextInput
                style={styles.input}
                value={explanation}
                onChangeText={setExplanation}
                placeholder="Explain word"
            />
            <Button title="WYSLIJ WYJASNIENIE" onPress={submitExplanation} />
            <Text>your player: {gameData.your_player_hash}</Text>
            <Text>{JSON.stringify(roomData, null, 4)}</Text>
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
    word: {
        fontSize: 30
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
