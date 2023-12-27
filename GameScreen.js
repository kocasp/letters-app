import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import db from './firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';


const GameScreen = ({ route }) => {
    const [roomData, setRoomData] = useState(null);
    const { gameData } = route.params;
    // console.log(gameData.id);


    useEffect(() => {
        const docRef = doc(db, "rooms", gameData.id);
        console.log(gameData.id);

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

    if (!roomData) return <Text>Loading...</Text>;

    return (
        <View>
            <Text>Room ID: {gameData.id}</Text>
            {/* Display all room data here */}
            {Object.entries(roomData).map(([key, value]) => (
                <Text key={key}>{`${key}: ${value}`}</Text>
            ))}
        </View>
    );
};

export default GameScreen;
