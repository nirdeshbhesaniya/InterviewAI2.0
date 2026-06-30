const { Client, Storage, ID } = require('node-appwrite');
const { InputFile } = require('node-appwrite/file');

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

/**
 * Uploads a file buffer to Appwrite Storage
 * @param {Buffer} buffer - The file buffer to upload
 * @param {string} fileName - The name of the file
 * @returns {Promise<Object>} - Contains secure_url and other metadata
 */
const uploadToAppwrite = async (buffer, fileName) => {
    try {
        if (!process.env.APPWRITE_PROJECT_ID || !process.env.APPWRITE_API_KEY || !process.env.APPWRITE_BUCKET_ID) {
            throw new Error('Appwrite credentials (APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_BUCKET_ID) are missing in environment variables.');
        }

        // Convert Node.js Buffer to File-like object required by node-appwrite 14+
        // Node-appwrite uses InputFile for uploading buffers
        const inputFile = InputFile.fromBuffer(buffer, fileName);

        // Upload the file to Appwrite bucket
        const result = await storage.createFile(
            process.env.APPWRITE_BUCKET_ID,
            ID.unique(),
            inputFile
        );

        // Generate the file URL for viewing
        const secure_url = `${process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'}/storage/buckets/${process.env.APPWRITE_BUCKET_ID}/files/${result.$id}/view?project=${process.env.APPWRITE_PROJECT_ID}`;

        return {
            secure_url,
            fileId: result.$id,
            fileName: result.name
        };
    } catch (error) {
        console.error('❌ Appwrite upload error:', error);
        throw error;
    }
};

module.exports = { uploadToAppwrite, storage, client };
