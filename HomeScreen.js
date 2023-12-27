// HomeScreen.js
import React, { useState } from 'react';
import { View, Button, Alert, ActivityIndicator, Text, StyleSheet } from 'react-native';

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

    return (
        <View style={styles.container}>
            <Button
                title="Stwórz grę"
                onPress={createGame}
                disabled={isCreatingGame}
            />
            {isCreatingGame && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                    <Text style={styles.loadingText}>Tworzenie gry...</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
