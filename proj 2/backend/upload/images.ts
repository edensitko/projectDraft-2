const multer = require('multer');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/'); // Specify the destination folder path
  },
  filename: (req, file, cb) => {
    const uniqueFileName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueFileName);
  }
});

// Set up multer upload
const upload = multer({ storage: storage });

// Define the upload service
const uploadImage = (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Error uploading image:', err);
      return res.status(500).json({ error: 'Failed to upload image' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = req.file.filename;
    return res.status(200).json({ imageUrl: imageUrl });
  });
};

module.exports = { uploadImage };
