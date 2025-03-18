document.addEventListener('DOMContentLoaded', () => {

    const URL = "http://127.0.0.1:5500/Ferme/model/";
    let score = 0;
    let animalToGuess, playerGuess;
    let round = 0;
    let startButton = document.querySelector('#start-button');
    let stopButton = document.querySelector('#stop-button');
    let gameStarted = false;
    let recognizer;
    
    async function createModel() {
        const checkpointURL = URL + "model.json"; 
        const metadataURL = URL + "metadata.json"; 
    
        recognizer = speechCommands.create(
            "BROWSER_FFT", 
            undefined, 
            checkpointURL,
            metadataURL);
    
        await recognizer.ensureModelLoaded();
    
        return recognizer;
    }
    
    async function init() {
        try {
            recognizer = await createModel();
            const classLabels = recognizer.wordLabels(); 

            startButton.addEventListener('click', () => {
                startGame(classLabels);
            });

            stopButton.addEventListener('click', () => {
                gameStarted = false;
                recognizer.stopListening();
                console.log("Game stopped.");
            });
    
            console.log("Recognizer is ready.");
        } catch (error) {
            console.error("Error initializing recognizer:", error);
        }
    }

    function getRandomAnimal(animals){
        const index = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
        return animals[index];
    }

    const startGame = async (classLabels) => {
        gameStarted = true;

        while (gameStarted){
            await startRound(classLabels);
        }
    }

    const startRound = async (classLabels) => {
        let animal = getRandomAnimal(classLabels);
        let playerGuesses = {};
        console.log('animal', animal);
    
        recognizer.listen(result => {
            console.log('résultats', result.scores);
            let highestScoreIndex = result.scores.indexOf(Math.max(...result.scores));
            let highestScoreLabel = classLabels[highestScoreIndex];
            let highestScore = result.scores[highestScoreIndex];

            let scoresCopy = [...result.scores];
            scoresCopy[highestScoreIndex] = -1; // Temporarily set the highest score to -1
            let secondHighestScoreIndex = scoresCopy.indexOf(Math.max(...scoresCopy));
            let secondHighestScoreLabel = classLabels[secondHighestScoreIndex];
            let secondHighestScore = scoresCopy[secondHighestScoreIndex];

            // Check if the highest score is backgroundNoise and the second highest score is greater than 0.75
            if (highestScoreLabel === 'Background Noise' && secondHighestScore > 0.75) {
                highestScoreLabel = secondHighestScoreLabel;
                highestScore = secondHighestScore;
            }

            // Store the highest score in playerGuesses with the label as the key
            playerGuesses[highestScoreLabel] = highestScore;
        }, {
            includeSpectrogram: true,
            probabilityThreshold: 0.75,
            invokeCallbackOnNoiseAndUnknown: false,
            overlapFactor: 0.50 
        });

        await new Promise(resolve => setTimeout(resolve, 3000));
        recognizer.stopListening();
        console.log("Recognizer has stopped listening.");

        console.log(playerGuesses)

        // Find the label with the highest score in playerGuesses
        let highestScore = -1;
        let secondHighestScore = -1;
        let secondHighestLabel = '';
        for (const [label, score] of Object.entries(playerGuesses)) {
            if (score > highestScore) {
                secondHighestScore = highestScore;
                secondHighestLabel = playerGuess;
                highestScore = score;
                playerGuess = label;
            } else if (score > secondHighestScore) {
                secondHighestScore = score;
                secondHighestLabel = label;
            }
        }

        // Check if the highest score is backgroundNoise and the second highest score is greater than 0.75
        if (playerGuess === 'Background Noise' && secondHighestScore > 0.75) {
            playerGuess = secondHighestLabel;
        }

        console.log('playerGuess', playerGuess);

        if (playerGuess === animal) {
            score++;
        }

        console.log('score', score);
    }
    
    init();
});