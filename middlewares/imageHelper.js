const multer  = require('multer')

FILE_MIME_TYPE = {
    'image/png':'png',
    'image/jpg':'jpg',
    'image/jpeg':'jpeg'
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_MIME_TYPE[file.mimetype]
    let uploadError = new Error("invalid image type")
    if(isValid){
        uploadError = null
    }
    cb(uploadError, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-")
    const extension = FILE_MIME_TYPE[file.mimetype]
    cb(null, `${fileName}` + '-' + `${Date.now()}.${extension}`)
  }
})

const uploadOptions = multer({ storage: storage })

module.exports = uploadOptions