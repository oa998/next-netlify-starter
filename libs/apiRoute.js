import crypto from "crypto";
import logger from "libs/logger";
import nextConnect from "next-connect";

const apiRoute = nextConnect({
  // Handle any other HTTP method
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
  onError: (err, req, res, next) => {
    const errorId = crypto.randomBytes(5).toString("hex");
    logger.error({ errorId, err, agent: req.headers?.["user-agent"] });
    res.status(500).end("An unexpected error occurred. Error ID: " + errorId);
  },
});

export default apiRoute;
