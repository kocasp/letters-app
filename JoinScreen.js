// JoinScreen.js
import React, { useState } from 'react';
import { View, Button, TextInput, Alert, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const JoinScreen = ({ route }) => {
    const navigation = useNavigation();
    const [playerName, setPlayerName] = useState('');
    const [isJoiningGame, setIsJoiningGame] = useState(false);
    const { roomId } = route.params;

    const handlePlayerNameChange = (text) => {
        setPlayerName(text.toUpperCase());
    };

    const joinGame = async () => {
        setIsJoiningGame(true);
        try {
            let response = await fetch(`https://us-central1-letters-9e7e6.cloudfunctions.net/joinRoom?playerName=${encodeURIComponent(playerName)}&roomName=${encodeURIComponent(roomId)}`);
            let json = await response.json();
            navigation.navigate('Game', { gameData: json }); // Navigate to GameScreen with response data
        } catch (error) {
            Alert.alert('Error', error.message);
        }
        setIsJoiningGame(false);
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Enter player name"
                value={playerName}
                onChangeText={handlePlayerNameChange}
            />
            <Button
                title="Dołącz"
                onPress={joinGame}
                disabled={isJoiningGame}
            />
            {isJoiningGame && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                    <Text style={styles.loadingText}>Joining game...</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    input: {
        width: '100%',
        marginBottom: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    loadingContainer: {
        marginTop: 20,
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 10
    }
});

export default JoinScreen;
