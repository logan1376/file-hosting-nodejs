const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 25567;

// Function to generate a unique filename
function generateUniqueFilename(req, file, cb) {
  const originalname = file.originalname;
  const extension = path.extname(originalname);
  const uniqueFilename = `${path.basename(originalname, extension)}_${Date.now()}${extension}`;
  cb(null, uniqueFilename);
}

// Function to scan the 'uploads' directory and update the videos array
function updateVideosArray() {
  const videos = [];
  const files = fs.readdirSync(path.join(__dirname, 'uploads'));

  files.forEach(file => {
    const videoInfo = {
      filename: file,
      path: path.join(__dirname, 'uploads', file),
    };
    videos.push(videoInfo);
  });

  // Save the updated videos array to the JSON file
  fs.writeFileSync(path.join(__dirname, 'videos.json'), JSON.stringify(videos), 'utf-8');
}

// Set up multer for handling file uploads with a unique filename
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: generateUniqueFilename,
});

const upload = multer({ storage: storage });

// Serve the HTML file for video upload
app.get('/uploadvideo', (req, res) => {
  res.sendFile(path.join(__dirname, 'upload.html'));
});

// Handle file upload
app.post('/upload', upload.single('video'), (req, res) => {
  updateVideosArray(); // Update videos array after each file upload
  res.json({ message: 'File uploaded successfully' });
});

// Serve the HTML file for displaying videos
app.get('/videos', (req, res) => {
  const videosFilePath = path.join(__dirname, 'videos.json');

  // Load video information from the JSON file
  const data = fs.readFileSync(videosFilePath, 'utf-8');
  const videos = JSON.parse(data);

  const videoList = videos.map(video => `<li><a href="/video/${video.filename}" target="_blank">${video.filename}</a></li>`).join('');
  const html = `<ul>${videoList}</ul>`;
  res.send(html);
});

// Serve video files
app.get('/video/:filename', (req, res) => {
  const filename = req.params.filename;
  const videoPath = path.join(__dirname, 'allowed', filename);

  res.sendFile(videoPath);
});

// Serve the videos.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'videos.html'));
});

// Start the server
app.listen(port, () => {
  // Scan and update the JSON file on server startup
  updateVideosArray();
  console.log(`Server is running at http://localhost:${port}`);
});
