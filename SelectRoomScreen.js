// SelectRoomScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

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
            <Text style={styles.title}>Wpisz kod pokoju:</Text>
            <TextInput
                style={styles.input}
                value={roomId}
                onChangeText={handleRoomIdChange}
                placeholder="Room ID"
            />
            <Button title="Join Game" onPress={handleJoinGame} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
