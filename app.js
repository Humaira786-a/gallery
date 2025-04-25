import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public/uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const DATA_PATH = path.join(__dirname, 'data/images.json');
const getImages = () => fs.existsSync(DATA_PATH) ? JSON.parse(fs.readFileSync(DATA_PATH)) : [];
const saveImages = (images) => fs.writeFileSync(DATA_PATH, JSON.stringify(images, null, 2));

app.get('/', (req, res) => {
  const images = getImages();
  res.render('index', { images });
});

app.get('/upload', (req, res) => {
  res.render('upload');
});

app.post('/upload', upload.single('image'), (req, res) => {
  const images = getImages();
  images.push({ filename: req.file.filename });
  saveImages(images);
  res.redirect('/');
});

app.listen(PORT, () => console.log(`✅ App running at http://localhost:${PORT}`));