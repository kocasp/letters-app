import React, { useEffect, useState, useRef } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    Button, 
    StyleSheet, 
    Keyboard, 
    Linking, 
    TouchableWithoutFeedback, 
    ImageBackground,
} from 'react-native';
import db from './firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import PrimaryButton from './components/PrimaryButton';

const GameScreen = ({ route }) => {
    const [roomData, setRoomData] = useState(null);
    const [letter, setLetter] = useState('');
    const [explanation, setExplanation] = useState('');
    const { gameData } = route.params;
    const reasons = {
        "word_finished": "ZAKOŃCZONO SŁOWO!",
        "checked_word_incorect": `PROPONOWANE SŁOWO NIE JEST POPRAWNE:`,
        "checked_word_correct": `PROPONOWANE SŁOWO JEST POPRAWNE:`
    }
    const textInputRef = useRef(null);

    const handleLetterChange = (text) => {
        setLetter(text.toUpperCase());
        if (text.length === 1) {
            Keyboard.dismiss();
        };
    };

    const handleExplanationChange = (text) => {
        setExplanation(text.toUpperCase());
    };

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

        // if (textInputRef.current && roomData && roomData.status === 'started' && roomData.currentPlayer === gameData.your_player_hash) {
        //     textInputRef.current.focus();
        // }

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
            setLetter('');
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

    // Function to render all players' points
    const renderPlayersPoints = () => {
        const playersEntries = Object.entries(roomData.players || {}).sort((a, b) => a[0].localeCompare(b[0]));; // Ensuring roomData.players is an object
        return playersEntries.map(([playerHash, playerDetails]) => (
            <Text key={playerHash}>
                {playerDetails.playerName || playerHash}: {playerDetails.points || 0} punktów karnych
            </Text>
        ));
    };

    const submitExplanation = async () => {
        try {
            // show alert and dont continue if explananion does not contain current word
            if (!explanation.includes(roomData.word)) {
                alert("Musisz podać słowo, ktore zawiera aktualne litery.");
                return;
            }
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

    const submitNewGame = async () => {
        try {
            const queryParams = new URLSearchParams({
                roomName: gameData.id,
                playerName: gameData.your_player_hash
            }).toString();

            const url = `https://us-central1-letters-9e7e6.cloudfunctions.net/resetGameStatus?${queryParams}`;
            const response = await fetch(url);
            // const responseData = await response.json();
            // console.log(responseData);
            // Handle the response data as needed
        } catch (error) {
            console.error("Error starting new game:", error);
        }
    };

    if (!roomData) return <Text>Ładowanie...</Text>;

    if (roomData.status === 'waiting_for_player') {
        return(

            <ImageBackground
                source={require('./assets/background.png')}
                resizeMode='repeat'
                style={styles.backgroundStyle}
            >
                <View style={styles.container}>
                    <Text style={{marginBottom: 30}}>Oczekiwanie na pozostałych graczy</Text>
                    <Text style={styles.roomName}>{gameData.id}</Text>
                    <Text style={{ textAlign: "center", marginTop: 30 }}>Podaj kod pokoju znajomemu aby mógł{"\n"} dołączyć do gry</Text>
                </View>
            </ImageBackground>
            )
    }

    if (roomData.status === 'started' && roomData.currentPlayer !== gameData.your_player_hash) {
        return (
            <View style={styles.container}>
                <Text style={styles.word}>{roomData.word}</Text>
                <Text>teraz gra: {roomData.players[roomData.currentPlayer]?.playerName}</Text>
            </View>)
    }

    if (roomData.status === 'started' && roomData.currentPlayer === gameData.your_player_hash) {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.container}>
                    <Text style={styles.word}>{roomData.word}</Text>
                    <Text>Twoja kolej</Text>
                    <TextInput
                        ref={textInputRef}
                        style={styles.input}
                        value={letter}
                        onChangeText={handleLetterChange}
                        placeholder="Podaj literke"
                        maxLength={1}
                    />
                    <Button title="LEWA" onPress={() => submitLetter('left')} />
                    <Button title="PRAWA" onPress={() => submitLetter('right')} />
                    <Button title="SPRAWDZ" onPress={checkWord} />
                </View>
            </TouchableWithoutFeedback>)
    }

    if (roomData.status === 'finished') {
        return (
            <View style={styles.container}>
                <Text>KONIEC GRY!</Text>
                <Text>{reasons[roomData.reason]} {roomData.explanation}</Text>
                <Text style={styles.word}>{roomData.word}</Text>
                <Text>Przegrał gracz: {roomData.players[roomData.lostPlayer]?.playerName}</Text>
                {renderPlayersPoints()}
                {roomData.reason !== 'word_incorect' && (
                    <Button
                        title="Sprawdz znaczenie slowa"
                        onPress={() => Linking.openURL('https://www.sjp.pl/'+roomData.word)}
                    />
                )}
                <Button title="NOWA GRA" onPress={submitNewGame} />
            </View>)
    }

    if (roomData.status === 'check' && roomData.currentPlayer !== gameData.your_player_hash) {
        return (
            <View style={styles.container}>
                <Text>GRACZ {roomData.players[roomData.lastPlayer]?.playerName} SPRAWDZA!</Text>
                <Text>teraz gra: {roomData.players[roomData.currentPlayer]?.playerName}</Text>
                <Text style={styles.word}>{roomData.word}</Text>
            </View>)
    }

    if (roomData.status === 'check' && roomData.currentPlayer === gameData.your_player_hash) {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.container}>
                    <Text>GRACZ {roomData.players[roomData.lastPlayer]?.playerName} SPRAWDZA!</Text>
                    <Text>teraz gra: {roomData.players[roomData.currentPlayer]?.playerName}</Text>
                    <Text style={styles.word}>{roomData.word}</Text>
                    <Text>Podaj swoje słowo:</Text>
                    <TextInput
                        style={styles.input}
                        value={explanation}
                        onChangeText={handleExplanationChange}
                        placeholder="Słowo"
                    />
                    <Button title="WYSLIJ WYJASNIENIE" onPress={submitExplanation} />
                </View>
            </TouchableWithoutFeedback>)
    }

    return (
        <View style={styles.container}>
            <Text>pokoj: {gameData.id}</Text>
            <Text>teraz gra: {roomData.players[roomData.currentPlayer]?.playerName}</Text>
            <Text style={styles.word}>{roomData.word}</Text>
            <TextInput
                style={styles.input}
                value={letter}
                onChangeText={handleLetterChange}
                placeholder="Podaj literke"
                maxLength={1}
            />
            <Button title="LEWA" onPress={() => submitLetter('left')} />
            <Button title="PRAWA" onPress={() => submitLetter('right')} />
            <Button title="SPRAWDZ" onPress={checkWord} />
            <TextInput
                style={styles.input}
                value={explanation}
                onChangeText={setExplanation}
                placeholder="Slowo"
            />
            <Button title="WYSLIJ WYJASNIENIE" onPress={submitExplanation} />
            <Button title="NOWA GRA" onPress={submitNewGame} />
            <Text>your player: {gameData.your_player_hash}</Text>
            <Text style={styles.debug}>{JSON.stringify(roomData, null, 4)}</Text>
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
        fontSize: 40,
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        margin: 10,
        width: '80%',
    },
    roomName: {
        fontSize: "40px",
        color: "#4A4A4A",
        textAlign: "center",
        fontWeight: "bold",
    },
    debug: {
        fontSize: 6,
    },
    backgroundStyle: {
        width: '100%', // Full width of the screen
        height: '100%', // Full height of the screen
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default GameScreen;
