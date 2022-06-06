import apiRoute from "libs/apiRoute";
import logger from "libs/logger";
import multer from "multer";
const { Storage } = require("@google-cloud/storage");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const routes = apiRoute;

routes.use(upload.array("uploaded-file"));

const credential = JSON.parse(
  Buffer.from(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64,
    "base64"
  ).toString()
);

logger.info(
  "cred..." + process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64.substr(0, 20)
);

logger.info("proj..." + process.env.GCP_PROJECT_ID);

function sendUploadToGCS(req, res, next) {
  return new Promise((resolve, reject) => {
    const uploadedFile = req.files[0];
    // The ID of your GCS bucket
    const bucketName = "cdn_js";

    const gcpStorage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      credentials: credential,
    });

    const gcsname =
      uploadedFile.originalname + "_" + Math.floor(Math.random() * 500);
    const bucket = gcpStorage.bucket(bucketName);
    const file = bucket.file(gcsname);

    const stream = file.createWriteStream({
      metadata: {
        contentType: uploadedFile.mimetype,
      },
      resumable: false,
    });

    stream.on("error", reject);

    stream.on("finish", resolve);

    stream.end(uploadedFile.buffer);
  });
}

// Process a POST request
routes
  .post(async (req, res, next) => {
    // const currFile = fs.readFileSync(
    //   path.resolve(path.resolve(), "public/uploads/abc.txt")
    // );

    // fs.writeFileSync(
    //   path.resolve(path.resolve(), "public/uploads/abc.txt"),
    //   [currFile, new Date().toLocaleString()].join("\n")
    // );

    sendUploadToGCS(req, res, next).then(() => {
      res
        .status(200)
        .json({ message: "hello", successfullyCalledBackend: true });
    });
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
