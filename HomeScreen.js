// HomeScreen.js
import React, { useState } from 'react';
import { View, Linking, Alert, ActivityIndicator, Text, Image, StyleSheet, ImageBackground } from 'react-native';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import LogoSvg from './components/LogoSvg'
import MarginWrapper from './components/MarginWrapper';

const HomeScreen = ({ navigation }) => {
    const [isCreatingGame, setIsCreatingGame] = useState(false);

    const createGame = async () => {
        try {
            setIsCreatingGame(true); // Disable button when request starts
            let response = await fetch('https://us-central1-letters-9e7e6.cloudfunctions.net/createRoom');
            let json = await response.json();
            setIsCreatingGame(false); // Re-enable button after request completes
            navigation.navigate('Join', { roomId: json.id });
        } catch (error) {
            Alert.alert('Error', 'Unable to create room');
        }
    };

    const joinGame = async () => {
        navigation.navigate('Select')
    }

    const handleRulesPress = async () => {
        const url = 'https://en.wikipedia.org/wiki/Ghost_(game)#Superghost';
        const supported = await Linking.canOpenURL(url);

        if (supported) {
            await Linking.openURL(url);
        } else {
            console.log(`Don't know how to open this URL: ${url}`);
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('./assets/background.png')}
                resizeMode='repeat'
                style={styles.backgroundStyle}
            >
                <MarginWrapper>
                    <LogoSvg 
                        style={{marginBottom: 60}}
                    />
                    <PrimaryButton
                        title="Rozpocznij nową grę"
                        onPress={createGame}
                        disabled={isCreatingGame}
                    />
                    <PrimaryButton
                        title="Dołącz do gry"
                        onPress={joinGame}
                        disabled={isCreatingGame}
                    />
                    <SecondaryButton
                        title="Zasady gry"
                        onPress={handleRulesPress}
                        disabled={isCreatingGame}
                    />
                    {isCreatingGame && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" />
                            <Text style={styles.loadingText}>Tworzenie gry...</Text>
                        </View>
                        )}
                </MarginWrapper>
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
        alignItems: 'center',
    },
    loadingContainer: {
        marginTop: 20,
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 10
    },
});

export default HomeScreen;
