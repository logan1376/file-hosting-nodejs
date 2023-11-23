const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 25567;
function generateUniqueFilename(req, file, cb) {
  const originalname = file.originalname;
  const extension = path.extname(originalname);
  const uniqueFilename = `${path.basename(originalname, extension)}_${Date.now()}${extension}`;
  cb(null, uniqueFilename);
}
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

  fs.writeFileSync(path.join(__dirname, 'videos.json'), JSON.stringify(videos), 'utf-8');
}
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: generateUniqueFilename,
});

const upload = multer({ storage: storage });

app.get('/uploadvideo', (req, res) => {
  res.sendFile(path.join(__dirname, 'upload.html'));
});

app.post('/upload', upload.single('video'), (req, res) => {
  updateVideosArray();
  res.json({ message: 'File uploaded successfully' });
});
app.get('/videos', (req, res) => {
  const videosFilePath = path.join(__dirname, 'videos.json');
  const data = fs.readFileSync(videosFilePath, 'utf-8');
  const videos = JSON.parse(data);

  const videoList = videos.map(video => `<li><a href="/video/${video.filename}" target="_blank">${video.filename}</a></li>`).join('');
  const html = `<ul>${videoList}</ul>`;
  res.send(html);
});
app.get('/video/:filename', (req, res) => {
  const filename = req.params.filename;
  const videoPath = path.join(__dirname, 'allowed', filename);

  res.sendFile(videoPath);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'videos.html'));
});

app.listen(port, () => {
  updateVideosArray();
  console.log(`Server is running at http://localhost:${port}`);
});
