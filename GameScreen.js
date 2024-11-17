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
    Image,
} from 'react-native';
import db from './firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import PrimaryButton from './components/PrimaryButton';
import ExitButton from './components/ExitButton';
import SecondaryButton from './components/SecondaryButton';
import PrimaryInput from './components/PrimaryInput';
import MarginWrapper from './components/MarginWrapper';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Clipboard from 'expo-clipboard';


const GameScreen = ({ route }) => {
    const navigation = useNavigation();
    const [roomData, setRoomData] = useState(null);
    const [letter, setLetter] = useState('');
    const [explanation, setExplanation] = useState('');
    const { gameData } = route.params;
    const [sound, setSound] = useState();
    const reasons = {
        "word_finished": "Zakończono słowo!",
        "checked_word_incorect": `Proponowane słowo nie jest poprawne:`,
        "checked_word_correct": `Proponowane słowo jest poprawne:`
    }

    const handleLetterChange = (text) => {
        if (text.length > 1) {
            Alert.alert("Mozesz wpisać tylko jedna literkę")
            Keyboard.dismiss();
            return; // Ignore input if it contains more than one character
        }
        setLetter(text.charAt(0).toUpperCase());
        if (text.length === 1) {
            Keyboard.dismiss();
        };
    };

    const handleExplanationChange = (text) => {
        setExplanation(text);
    };

    const handleGoHome = function () {
        navigation.navigate('Home');
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

    useEffect(() => {
        const playSound = async () => {
            if (roomData && roomData.word && gameData.your_player_hash === roomData.currentPlayer) {
                try {
                    const { sound: newSound } = await Audio.Sound.createAsync(require('./assets/audio/letter_added.mp3'));
                    setSound(newSound);
                    await newSound.playAsync();
                } catch (error) {
                    console.error('Error playing sound:', error);
                }
            }
        };
    
        playSound();
    
        // Don't forget to unload the sound when component unmounts or when the sound changes
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [roomData ? roomData.word : null]);
    

    const submitLetter = async (side) => {
        if (!letter) {
            Alert.alert("Wpisz literę");
            return;
        }
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
            <Text key={playerHash} style={styles.playerPoints}>
                {playerDetails.playerName.toUpperCase() || playerHash}: {playerDetails.points || 0}
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
        
        const copyToClipboard = async () => {
            await Clipboard.setStringAsync(gameData.id);
            alert('Kod został skopiowany do schowka!');
        };

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
                            <Text onPress={copyToClipboard} style={styles.roomName}>{gameData.id}</Text>
                            <Text style={{color: '#aaaaaa'}}>Kliknij kod aby skopiowac do schowka</Text>
                            <Text style={{ textAlign: "center", marginTop: 30, marginBottom: 30 }}>Podaj kod pokoju znajomemu aby mógł{"\n"} dołączyć do gry</Text>
                            <SecondaryButton
                                title="Anuluj"
                                onPress={handleGoHome}
                            />
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
                            <View style={styles.exitButtonWrapper}>
                                <ExitButton onPress={exitGame}/>
                            </View>
                            <View style={styles.pointsWrapper}>
                                {renderPlayersPoints()}
                            </View>
                            <Text style={styles.word}>{roomData.word}</Text>
                            <Image source={require('./assets/loader.gif')} style={{ width: 45, height: 15, marginBottom: 20 }} />
                            <Text style={{marginBottom: 30}}>TERAZ GRA: {roomData.players[roomData.currentPlayer]?.playerName.toUpperCase()}</Text>
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
                            <View style={styles.exitButtonWrapper}>
                                <ExitButton onPress={exitGame}/>
                            </View>
                            <View style={styles.pointsWrapper}>
                                {renderPlayersPoints()}
                            </View>
                            <Text style={styles.word}>{roomData.word}</Text>
                            <PrimaryInput
                                value={letter}
                                onChangeText={handleLetterChange}
                                placeholder="Podaj literke"
                                maxLength={1}
                            />
                            <View style={styles.sideButtonsWrapper}>
                                <PrimaryButton title="LEWA" onPress={() => submitLetter('left')} style={{flex: 1, marginLeft: 0}} />
                                <PrimaryButton title="PRAWA" onPress={() => submitLetter('right')} style={{flex: 1, marginRight: 0}} />
                            </View>
                            <SecondaryButton title="SPRAWDZ" onPress={checkWord} />
                        </MarginWrapper>
                    </ImageBackground>
                </TouchableWithoutFeedback>
            </View >)
    }

    if (roomData.status === 'finished') {
        let reason_text = ''
        if (roomData.reason == 'word_finished') {
            reason_text = 'GRACZ ' + roomData.players[roomData.lostPlayer]?.playerName.toUpperCase()+' ZAKOŃCZYŁ SŁOWO!';
        }
        if (roomData.reason == 'checked_word_incorect') {
            reason_text = 'GRACZ ' + roomData.players[roomData.lostPlayer]?.playerName.toUpperCase()+' PODAŁ NIEPOPRAWNE SŁOWO!';
        }
        if (roomData.reason == 'checked_word_correct') {
            reason_text = 'GRACZ ' + roomData.players[roomData.lastPlayer]?.playerName.toUpperCase()+' PODAŁ POPRAWNE SŁOWO!';
        }
        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <ImageBackground
                            source={require('./assets/background.png')}
                            resizeMode='repeat'
                            style={styles.backgroundStyle}
                        >
                        <MarginWrapper>
                            <View style={styles.exitButtonWrapper}>
                                <ExitButton onPress={exitGame}/>
                            </View>
                            <View style={styles.pointsWrapper}>
                                {renderPlayersPoints()}
                            </View>
                            <Text style={styles.finishMessage[roomData.reason]}>{reason_text}</Text>
                            <Text style={styles.word}>{roomData.word}</Text>
                            {roomData.reason !== 'checked_word_incorect' && (
                                <PrimaryButton
                                    title="SPRAWDŹ ZNACZENIE"
                                    onPress={() => Linking.openURL('https://www.sjp.pl/'+roomData.word)}
                                />
                            )}
                            {roomData.lostPlayer == gameData.your_player_hash && (
                                <PrimaryButton
                                    title="NOWA RUNDA"
                                    onPress={submitNewGame}
                                />
                            )}
                            {roomData.lostPlayer != gameData.your_player_hash && (
                                <Text style={{marginBottom: 20, marginTop: 20}}>{roomData.players[roomData.lostPlayer]?.playerName.toUpperCase()} ROZPOCZYNA NOWĄ RUNDĘ</Text>
                            )}
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
                            <View style={styles.exitButtonWrapper}>
                                <ExitButton onPress={exitGame}/>
                            </View>
                            <View style={styles.pointsWrapper}>
                                {renderPlayersPoints()}
                            </View>
                            <Text style={styles.checkMessage}>GRACZ {roomData.players[roomData.lastPlayer]?.playerName.toUpperCase()} SPRAWDZA!</Text>
                            <Text style={styles.word}>{roomData.word}</Text>
                            <Image source={require('./assets/loader.gif')} style={{ width: 45, height: 15, marginBottom: 20 }} />
                            <Text style={{marginBottom: 30}}>TERAZ GRA: {roomData.players[roomData.currentPlayer]?.playerName.toUpperCase()}</Text>
                            {/* <Text>{JSON.stringify(roomData)}</Text> */}
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
                            <View style={styles.exitButtonWrapper}>
                                <ExitButton onPress={exitGame}/>
                            </View>
                            <View style={styles.pointsWrapper}>
                                {renderPlayersPoints()}
                            </View>
                            <Text style={styles.checkMessage}>GRACZ {roomData.players[roomData.lastPlayer]?.playerName.toUpperCase()} SPRAWDZA!</Text>
                            <Text style={styles.word}>{roomData.word}</Text>
                            <PrimaryInput
                                value={explanation}
                                onChangeText={handleExplanationChange}
                                placeholder="Podaj swoje słowo"
                            />
                            <PrimaryButton title="WYSLIJ WYJASNIENIE" onPress={submitExplanation} />
                            {/* <Text>{JSON.stringify(roomData)}</Text> */}
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
                    <Text>ERROR</Text>
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
        marginBottom: 15,
        marginTop: 15,
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
        flexDirection: 'row',
        alignItems: 'stretch',
        alignContent: 'stretch',
    },
    playerPoints: {
        fontSize: 19,
        color: "#4A4A4A",
        fontWeight: "bold",
    },
    pointsWrapper: {
        position: 'absolute',
        left: 30,
        top: 50,
    },
    exitButtonWrapper: {
        position: 'absolute',
        top: 50,
        right: 30,
    },
    checkMessage: {
        fontSize: 19,
        color: "#CF0089",
        textAlign: "center",
        fontWeight: "bold",
    },
    finishMessage: {
        word_finished: {
            fontSize: 19,
            color: "#5A1F85",
            textAlign: "center",
            fontWeight: "bold",
        },
        checked_word_incorect: {
            fontSize: 19,
            color: "#EF406D",
            textAlign: "center",
            fontWeight: "bold",

        },
        checked_word_correct: {
            fontSize: 19,
            color: "#FBC421",
            textAlign: "center",
            fontWeight: "bold",

        }
    }
});

export default GameScreen;
