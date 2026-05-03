import multer from "multer";

// store in memory, not disk — we don't need to save the file
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)  // accept
    } else {
      cb(new Error('Only PDF files allowed'), false)  // reject
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }  // 5MB max
})

export default upload