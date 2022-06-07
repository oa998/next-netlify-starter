import apiRoute from "libs/apiRoute";

const routes = apiRoute();

const set = (cats) =>
  fetch(`https://api.jsonbin.io/b/${process.env.BIN_ID}`, {
    method: "PUT",
    body: JSON.stringify(cats),
    headers: {
      "content-type": "application/json",
      "X-Master-Key": process.env.JSON_BIN_MASTER_KEY,
    },
  });

const get = () =>
  fetch(`https://api.jsonbin.io/b/${process.env.BIN_ID}/latest`, {
    headers: {
      "X-Master-Key": process.env.JSON_BIN_MASTER_KEY,
    },
  }).then((x) => x.json());

routes
  .post(async (req, res) => {
    const previous = await get();
    const latest = req.body;
    const updated = { ...previous, ...latest };
    set(updated)
      .then(get)
      .then((json) =>
        res.status(200).json({ saved: json, submitted: updated })
      );
  })
  .get((req, res) => {
    get().then((cats) => res.status(200).json(cats));
  });

export default routes;
