const logger = require("pino")({
  nestedKey: "payload",
  formatters: {
    level: (label, number) => {
      return { level: label };
    },
  },
});

export default logger;
