const cloudinary = require('cloudinary').v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log configuration status on module load
console.log('🔧 Cloudinary Configuration Check:');
console.log('  Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('  API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('  API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');
console.log('  Uploader available:', typeof cloudinary.uploader !== 'undefined' ? '✅ Yes' : '❌ No');

// Validate Cloudinary configuration
const validateCloudinaryConfig = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();

  if (!cloud_name || !api_key || !api_secret) {
    console.error('❌ Cloudinary configuration missing!');
    console.error('Cloud Name:', cloud_name ? '✅' : '❌');
    console.error('API Key:', api_key ? '✅' : '❌');
    console.error('API Secret:', api_secret ? '✅' : '❌');
    throw new Error('Cloudinary credentials are not properly configured. Please check your environment variables.');
  }

  return true;
};

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    // Check if cloudinary.uploader exists
    if (!cloudinary.uploader || typeof cloudinary.uploader.upload_stream !== 'function') {
      console.error('❌ Cloudinary uploader is not available!');
      console.error('   This usually means:');
      console.error('   1. The cloudinary package is not installed correctly');
      console.error('   2. The environment variables are missing');
      console.error('   3. There is a version mismatch');
      return reject(new Error('Cloudinary uploader is not available. Please check your Cloudinary configuration.'));
    }

    // Validate configuration before attempting upload
    try {
      validateCloudinaryConfig();
    } catch (configError) {
      return reject(configError);
    }

    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          ...options
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Image uploaded to Cloudinary:', result.secure_url);
            resolve(result);
          }
        }
      );

      if (!uploadStream) {
        return reject(new Error('Failed to create Cloudinary upload stream'));
      }

      uploadStream.end(buffer);
    } catch (streamError) {
      console.error('❌ Error creating upload stream:', streamError);
      reject(new Error('Failed to create upload stream: ' + streamError.message));
    }
  });
};

module.exports = { cloudinary, uploadToCloudinary };
