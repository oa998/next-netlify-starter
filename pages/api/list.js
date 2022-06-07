import apiRoute from "libs/apiRoute";
const { Storage } = require("@google-cloud/storage");

const routes = apiRoute();

const credential = JSON.parse(
  Buffer.from(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64,
    "base64"
  ).toString()
);

async function listAllFiles() {
  // The ID of your GCS bucket
  const bucketName = "cdn_js";

  const gcpStorage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: credential,
  });

  const [files] = await gcpStorage.bucket(bucketName).getFiles();
  return files.map(
    ({ id }) => `https://storage.googleapis.com/${bucketName}/${id}`
  );
}

routes.get((req, res) => {
  listAllFiles().then((files) => res.status(200).json({ files }));
});

export default routes;
