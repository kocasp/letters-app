// HomeScreen.js
import React, { useState } from 'react';
import { View, Button, Alert, ActivityIndicator, Text, StyleSheet, ImageBackground } from 'react-native';

const HomeScreen = ({ navigation }) => {
    const [isCreatingGame, setIsCreatingGame] = useState(false);

    const createGame = async () => {
        setIsCreatingGame(true); // Disable button when request starts
        try {
            let response = await fetch('https://us-central1-letters-9e7e6.cloudfunctions.net/createRoom');
            let json = await response.json();
            navigation.navigate('Join', { roomId: json.id });
        } catch (error) {
            Alert.alert('Error', 'Unable to create room');
        }
        setIsCreatingGame(false); // Re-enable button after request completes
    };

    const joinGame = async () => {
        setIsCreatingGame(true);
        navigation.navigate('Select')
    }

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('./assets/letters_background.png')}
                resizeMode='repeat'
                style={styles.backgroundStyle}
            >
                <Button
                    title="Stwórz grę"
                    onPress={createGame}
                    disabled={isCreatingGame}
                />
                <Button
                    title="Dolacz do gry"
                    onPress={joinGame}
                    disabled={isCreatingGame}
                />
                {isCreatingGame && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" />
                        <Text style={styles.loadingText}>Tworzenie gry...</Text>
                    </View>
                )}
            </ImageBackground>
        </View>
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

export default HomeScreen;
