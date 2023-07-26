const express = require('express');
const multer = require('multer');
const app = express();
const port = 4000;

// Configure the storage destination and filename for the uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Store the images in the "uploads" folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ storage: storage });

// Define the route to handle the image upload
app.post('/api/vac/addVac', upload.single('imageFile'), (req, res) => {
  // Process the uploaded image here, and save its details to the database if needed
  // The uploaded file can be accessed using req.file

  // Example: Save the image file name to a variable and send it as a response
  const uploadedFileName = req.file.filename;
  res.json({ message: 'Image uploaded successfully', filename: uploadedFileName });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
