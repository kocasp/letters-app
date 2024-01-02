// SelectRoomScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ImageBackground } from 'react-native';

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
                source={require('./assets/letters_background.png')}
                resizeMode='repeat'
                style={styles.backgroundStyle}
            >
            
            <Text style={styles.title}>Wpisz kod pokoju:</Text>
            <TextInput
                style={styles.input}
                value={roomId}
                onChangeText={handleRoomIdChange}
                placeholder="Room ID"
            />
            <Button title="Join Game" onPress={handleJoinGame} />
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
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 20,
    }
});

export default SelectRoomScreen;
