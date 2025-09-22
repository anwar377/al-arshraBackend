const multer = require('multer');

// Use memory storage to get buffer for Cloudinary upload
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
