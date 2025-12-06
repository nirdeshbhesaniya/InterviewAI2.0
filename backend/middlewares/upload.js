const multer = require('multer');

const storage = multer.memoryStorage(); // ✅ in-memory only, no disk
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  cb(null, extname && mimetype);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
