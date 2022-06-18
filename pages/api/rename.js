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

  const [files] = await gcpStorage.bucket(bucketName).getFiles({
    // maxResults: 70,
  });

  const oldlist = [];
  const newlist = [];

  for (const file of files) {
    const originalName = file.id;
    const cats = originalName.split("_")[0];
    const oldNumber = +originalName.split("_")[1];
    const renamed = `${oldNumber}_${cats}`;

    oldlist.push(originalName);
    newlist.push(renamed);

    console.log(`${originalName} renamed to ${renamed}`);
    // await gcpStorage.bucket(bucketName).file(originalName).rename(renamed);
  }

  // const oldAlpha = oldlist.slice().sort();
  // const newAlpha = newlist.slice().sort();
  // console.log({
  //   o1: oldlist,
  //   oa: oldAlpha,
  //   n1: newlist,
  //   na: newAlpha,
  // });

  return "done";
}

routes.get((req, res) => {
  listAllFiles().then((files) => res.status(200).json({ files }));
});

export default routes;
