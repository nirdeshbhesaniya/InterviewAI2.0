const GoogleTTSService = require('./services/GoogleTTSService');
const fs = require('fs');
const path = require('path');

async function testGoogleTTS() {
    console.log('Testing Google TTS Integration...');
    try {
        const text = "Hello, this is a test of the Google Text to Speech integration with an Indian English accent.";
        const buffer = await GoogleTTSService.generateAudio(text);

        if (buffer) {
            const outputPath = path.join(__dirname, 'test-google-tts.mp3');
            fs.writeFileSync(outputPath, buffer);
            console.log(`✅ Success! Audio saved to ${outputPath} (${buffer.length} bytes)`);
        } else {
            console.error('❌ Failed to generate audio (buffer is null)');
        }

    } catch (error) {
        console.error('❌ Error testing Google TTS:', error);
    }
}

testGoogleTTS();
