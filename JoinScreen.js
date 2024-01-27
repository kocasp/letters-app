// JoinScreen.js
import React, { useState } from 'react';
import { View, Button, TextInput, Alert, ActivityIndicator, Text, StyleSheet, TouchableWithoutFeedback, Keyboard, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PrimaryInput from './components/PrimaryInput';
import PrimaryButton from './components/PrimaryButton';
import MarginWrapper from './components/MarginWrapper';

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
            Alert.alert('Error joining game', error.message);
        }
        setIsJoiningGame(false);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <ImageBackground
                    source={require('./assets/background.png')}
                    resizeMode='repeat'
                    style={styles.backgroundStyle}
                >
                    <MarginWrapper>
                        <PrimaryInput
                            placeholder="Podaj imię"
                            value={playerName}
                            onChangeText={handlePlayerNameChange}
                        />
                        <PrimaryButton
                            title="Załóż pokój"
                            onPress={joinGame}
                            disabled={isJoiningGame}
                        />
                        {isJoiningGame && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" />
                                <Text style={styles.loadingText}>Dołączanie...</Text>
                            </View>
                        )}
                    </MarginWrapper>
                </ImageBackground>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%', // Ensure it takes full width
        height: '100%', // Ensure it takes full height
        justifyContent: 'center',
        alignItems: 'center'
    },
    backgroundStyle: {
        width: '100%', // Full width of the screen
        height: '100%', // Full height of the screen
        justifyContent: 'center',
        alignItems: 'center'
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
