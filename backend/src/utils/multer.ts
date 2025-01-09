import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer for handling image and GIF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);  // Set the destination folder for uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Set a unique filename
  },
});

// Accept both images and GIFs and audio
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const validFileTypes = /jpeg|jpg|png|gif|mp3|wav|m4a/; // Include audio file types
  const extname = validFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = validFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    const error = new Error('Only image, GIF, and audio files are allowed');
    cb(error as any, false);
  }
};

// Create the multer instance for multiple fields
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },  // Set file size limit to 50MB
});

export default upload;