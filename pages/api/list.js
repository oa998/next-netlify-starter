import apiRoute from "libs/apiRoute";
const { Storage } = require("@google-cloud/storage");

const routes = apiRoute();

const credential = JSON.parse(
  Buffer.from(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64,
    "base64"
  ).toString()
);

async function listAllFiles(previousPageToken) {
  // The ID of your GCS bucket
  const bucketName = "cdn_js";

  const gcpStorage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: credential,
  });

  const [files, { pageToken }] = await gcpStorage.bucket(bucketName).getFiles({
    maxResults: 10,
    pageToken: previousPageToken,
  });
  const returnList = [];
  for (const file of files) {
    const [data] = await file.getMetadata();
    const customMeta = data.metadata || {};
    const obj = {
      url: `https://storage.googleapis.com/${bucketName}/${file.id}`,
      ...customMeta,
    };
    returnList.push(obj);
  }
  return {
    files: returnList,
    pageToken,
  };
}

routes.get((req, res) => {
  const pageToken = req.query.pageToken;
  listAllFiles(pageToken).then((data) => res.status(200).json(data));
});

export default routes;
