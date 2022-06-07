import apiRoute from "libs/apiRoute";
import multer from "multer";
const { Storage } = require("@google-cloud/storage");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const routes = apiRoute();

routes.use(upload.array("uploaded-file"));

const credential = JSON.parse(
  Buffer.from(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64,
    "base64"
  ).toString()
);

function sendUploadToGCS(req, res, next) {
  return new Promise((resolve, reject) => {
    const checks = req.headers["checks"]; // a string like "ap" for "arya" and "pik"
    const time = req.headers["time"]; // a string like "ap" for "arya" and "pik"
    const uploadedFile = req.files[0];

    console.log({ time });
    // The ID of your GCS bucket
    const bucketName = "cdn_js";

    const gcpStorage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      credentials: credential,
    });

    const gcsname = `${checks}_${time}`;
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
routes.post(async (req, res, next) => {
  sendUploadToGCS(req, res, next).then(() => {
    res.status(200).json({ message: "hello", successfullyCalledBackend: true });
  });
});

export default routes;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
