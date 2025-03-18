document.addEventListener('DOMContentLoaded', () => {

    const URL = "http://localhost:65345/model/";
    
    async function createModel() {
        const checkpointURL = URL + "model.json"; 
        const metadataURL = URL + "metadata.json"; 
    
        const recognizer = speechCommands.create(
            "BROWSER_FFT", 
            undefined, 
            checkpointURL,
            metadataURL);
    
        await recognizer.ensureModelLoaded();
        console.log(recognizer.wordLabels());
    
        return recognizer;
    }
    
    async function init() {
        try {
            const recognizer = await createModel();
            const classLabels = recognizer.wordLabels(); 
            const labelContainer = document.getElementById("label-container");
            for (let i = 0; i < classLabels.length; i++) {
                labelContainer.appendChild(document.createElement("div"));
            }
    
            recognizer.listen(result => {
                const scores = result.scores;
                for (let i = 0; i < classLabels.length; i++) {
                    const classPrediction = classLabels[i] + ": " + result.scores[i].toFixed(2);
                    labelContainer.childNodes[i].innerHTML = classPrediction;
                }
                console.log(scores)
            }, {
                includeSpectrogram: true,
                probabilityThreshold: 0.75,
                invokeCallbackOnNoiseAndUnknown: false,
                overlapFactor: 0.50 
            });
    
            console.log("Recognizer is listening...");
        } catch (error) {
            console.error("Error initializing recognizer:", error);
        }
    }
    
    init();
});