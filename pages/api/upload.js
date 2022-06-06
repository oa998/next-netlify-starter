import apiRoute from "libs/apiRoute";
import multer from "multer";

const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads",
    filename: (req, file, cb) => cb(null, file.originalname),
  }),
});

const routes = apiRoute;

routes.use(upload.array("uploaded-file"));

// Process a POST request
routes
  .post(async (req, res) => {
    // logger.info(Object.keys(req.body));
    res.status(200).json({ message: "hello", successfullyCalledBackend: true });
  })
  .get((req, res) => {
    res.status(200).json({ message: "hello" });
  });

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

/*

// The ID of your GCS bucket
// const bucketName = 'your-unique-bucket-name';

// The path to your file to upload
// const filePath = 'path/to/your/file';

// The new ID for your GCS file
// const destFileName = 'your-new-file-name';

// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');

// Creates a client
const storage = new Storage();

async function uploadFile() {
  await storage.bucket(bucketName).upload(filePath, {
    destination: destFileName,
  });

  console.log(`${filePath} uploaded to ${bucketName}`);
}

uploadFile().catch(console.error);


*/
