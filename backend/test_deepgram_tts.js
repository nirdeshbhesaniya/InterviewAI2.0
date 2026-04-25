require('dotenv').config();
const DeepgramService = require('./services/DeepgramService');
const fs = require('fs');

async function testTTS() {
    console.log("Testing Deepgram TTS...");
    const text = "Hello! This is a test of the Indian English voice model.";

    try {
        const service = new DeepgramService();
        const audioBuffer = await service.generateAudio(text);

        if (audioBuffer) {
            fs.writeFileSync('test_output.mp3', audioBuffer);
            console.log("✅ Success! Audio saved to test_output.mp3");
        } else {
            console.error("❌ Failed to generate audio.");
        }
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

testTTS();
