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
    Alert,
} from 'react-native';
import db from './firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import PrimaryInput from './components/PrimaryInput';
import MarginWrapper from './components/MarginWrapper';
import { useNavigation } from '@react-navigation/native';

const GameScreen = ({ route }) => {
    const navigation = useNavigation();
    const [roomData, setRoomData] = useState(null);
    const [letter, setLetter] = useState('');
    const [explanation, setExplanation] = useState('');
    const { gameData } = route.params;
    const reasons = {
        "word_finished": "Zakończono słowo!",
        "checked_word_incorect": `Proponowane słowo nie jest poprawne:`,
        "checked_word_correct": `Proponowane słowo jest poprawne:`
    }
    const textInputRef = useRef(null);

    const handleLetterChange = (text) => {
        setLetter(text.toUpperCase());
        if (text.length === 1) {
            Keyboard.dismiss();
        };
    };

    const handleExplanationChange = (text) => {
        setExplanation(text);
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

    const exitGame = async () => {
        try {
            Alert.alert(
                "Opuść grę",
                "Jesteś pewien?",
                [
                    { 
                        text: "Nie", 
                        onPress: () => console.log("Cancelled"), 
                        style: "cancel"
                    },
                    { 
                        text: "Tak", 
                        onPress: () => navigation.navigate('Home'),
                    },
                ]
            );
        } catch (error) {
            console.error("Error exiting game:", error);
        }
    }

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
            if (!explanation.toLowerCase().includes(roomData.word.toLowerCase())) {
                alert("Musisz podać słowo, ktore zawiera aktualne litery.");
                return;
            }
            const queryParams = new URLSearchParams({
                roomName: gameData.id,
                playerName: gameData.your_player_hash, // Replace with actual playerName if different
                word: explanation,
            }).toString();
            setExplanation(null);
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

            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <ImageBackground
                        source={require('./assets/background.png')}
                        resizeMode='repeat'
                        style={styles.backgroundStyle}
                    >
                        <MarginWrapper>
                            <Text style={{marginBottom: 30}}>Oczekiwanie na pozostałych graczy</Text>
                            <Text style={styles.roomName}>{gameData.id}</Text>
                            <Text style={{ textAlign: "center", marginTop: 30 }}>Podaj kod pokoju znajomemu aby mógł{"\n"} dołączyć do gry</Text>
                            <SecondaryButton title="WYJDŹ" onPress={exitGame} />
                        </MarginWrapper>
                    </ImageBackground>
                </TouchableWithoutFeedback>
            </View >
            )
    }

    if (roomData.status === 'started' && roomData.currentPlayer !== gameData.your_player_hash) {
        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <ImageBackground
                        source={require('./assets/background.png')}
                        resizeMode='repeat'
                        style={styles.backgroundStyle}
                    >
                        <MarginWrapper>
                            <Text style={styles.word}>{roomData.word}</Text>
                            <Text>teraz gra: {roomData.players[roomData.currentPlayer]?.playerName}</Text>
                            <SecondaryButton title="WYJDŹ" onPress={exitGame} />
                        </MarginWrapper>
                    </ImageBackground>
                </TouchableWithoutFeedback>
            </View >)
    }

    if (roomData.status === 'started' && roomData.currentPlayer === gameData.your_player_hash) {
        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <ImageBackground
                        source={require('./assets/background.png')}
                        resizeMode='repeat'
                        style={styles.backgroundStyle}
                    >
                        <MarginWrapper>
                            <Text style={styles.word}>{roomData.word}</Text>
                            <PrimaryInput
                                ref={textInputRef}
                                value={letter}
                                onChangeText={handleLetterChange}
                                placeholder="Podaj literke"
                                maxLength={1}
                            />
                            <View style={styles.sideButtonsWrapper}>
                                <PrimaryButton title="LEWA" onPress={() => submitLetter('left')} style={{flex: 1, marginLeft: 0}} />
                                <PrimaryButton title="PRAWA" onPress={() => submitLetter('right')} style={{flex: 1, marginRight: 0}} />
                            </View>
                            <PrimaryButton title="SPRAWDZ" onPress={checkWord} />
                            <SecondaryButton title="WYJDŹ" onPress={exitGame} />
                        </MarginWrapper>
                    </ImageBackground>
                </TouchableWithoutFeedback>
            </View >)
    }

    if (roomData.status === 'finished') {
        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <ImageBackground
                            source={require('./assets/background.png')}
                            resizeMode='repeat'
                            style={styles.backgroundStyle}
                        >
                        <MarginWrapper>
                            <Text>Koniec gry!</Text>
                            <Text>{reasons[roomData.reason]} {roomData.explanation}</Text>
                            <Text style={styles.word}>{roomData.word}</Text>
                            <Text>Przegrał gracz: {roomData.players[roomData.lostPlayer]?.playerName}</Text>
                            {renderPlayersPoints()}
                            {roomData.reason !== 'word_incorect' && (
                                <PrimaryButton
                                    title="SPRAWDŹ ZNACZENIE"
                                    onPress={() => Linking.openURL('https://www.sjp.pl/'+roomData.word)}
                                />
                            )}
                            <PrimaryButton title="NOWA RUNDA" onPress={submitNewGame} />
                            <SecondaryButton title="WYJDŹ" onPress={exitGame} />
                        </MarginWrapper>
                    </ImageBackground>
                </TouchableWithoutFeedback>
            </View >)
    }

    if (roomData.status === 'check' && roomData.currentPlayer !== gameData.your_player_hash) {
        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <ImageBackground
                        source={require('./assets/background.png')}
                        resizeMode='repeat'
                        style={styles.backgroundStyle}
                    >
                        <MarginWrapper>
                            <Text>Gracz {roomData.players[roomData.lastPlayer]?.playerName} sprawdza!</Text>
                            <Text>Teraz gra: {roomData.players[roomData.currentPlayer]?.playerName}</Text>
                            <Text style={styles.word}>{roomData.word}</Text>
                            <SecondaryButton title="WYJDŹ" onPress={exitGame} />
                        </MarginWrapper>
                    </ImageBackground>
                </TouchableWithoutFeedback>
            </View >)
    }

    if (roomData.status === 'check' && roomData.currentPlayer === gameData.your_player_hash) {
        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <ImageBackground
                        source={require('./assets/background.png')}
                        resizeMode='repeat'
                        style={styles.backgroundStyle}
                    >
                        <MarginWrapper>
                            <Text>Gracz {roomData.players[roomData.lastPlayer]?.playerName} sprawdza!</Text>
                            <Text>Teraz gra: {roomData.players[roomData.currentPlayer]?.playerName}</Text>
                            <Text style={styles.word}>{roomData.word}</Text>
                            <Text>Podaj swoje słowo:</Text>
                            <PrimaryInput
                                value={explanation}
                                onChangeText={handleExplanationChange}
                                placeholder="Słowo"
                            />
                            <PrimaryButton title="WYSLIJ WYJASNIENIE" onPress={submitExplanation} />
                            <SecondaryButton title="WYJDŹ" onPress={exitGame} />
                        </MarginWrapper>
                    </ImageBackground>
                </TouchableWithoutFeedback>
           </View>
           )
    }

    return (
        <View style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ImageBackground
                    source={require('./assets/background.png')}
                    resizeMode='repeat'
                    style={styles.backgroundStyle}
                >
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
                    <Button title="NOWA RUNDA" onPress={submitNewGame} />
                    <Text>your player: {gameData.your_player_hash}</Text>
                    <Text style={styles.debug}>{JSON.stringify(roomData, null, 4)}</Text>
                </ImageBackground>
            </TouchableWithoutFeedback>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    word: {
        fontSize: 40,
        color: "#4A4A4A",
        textAlign: "center",
        fontWeight: "bold",
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        margin: 10,
        width: '80%',
    },
    roomName: {
        fontSize: 40,
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
    sideButtonsWrapper: {
        flex: 0,
        flexDirection: 'row',
    },
});

export default GameScreen;
