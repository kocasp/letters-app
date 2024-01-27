// SelectRoomScreen.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ImageBackground } from 'react-native';
import PrimaryInput from './components/PrimaryInput';
import PrimaryButton from './components/PrimaryButton';
import MarginWrapper from './components/MarginWrapper';

const SelectRoomScreen = ({ navigation }) => {
    const [roomId, setRoomId] = useState('');

    const handleJoinGame = () => {
        navigation.navigate('Join', { roomId: roomId });
    };

    const handleRoomIdChange = (text) => {
        // Convert the text to uppercase and update the state
        setRoomId(text.toUpperCase());
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('./assets/background.png')}
                resizeMode='repeat'
                style={styles.backgroundStyle}
            >
                <MarginWrapper>
            
                    <Text style={styles.title}>Wpisz kod pokoju:</Text>
                    <PrimaryInput
                        value={roomId}
                        onChangeText={handleRoomIdChange}
                        placeholder="Kod pokoju"
                    />
                    <PrimaryButton title="Dołącz do gry" onPress={handleJoinGame} />
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
        alignItems: 'center'
    },
    title: {
        fontSize: 20,
        marginBottom: 10,
    },
});

export default SelectRoomScreen;
