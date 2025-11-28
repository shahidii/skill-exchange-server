const pinoHttp = require("pino-http");
const { logger } = require("../config/pino");

// Only keep these headers
function filterHeaders(headers) {
  const whitelist = ["host", "authorization", "content-type"]; // add more if needed
  return Object.fromEntries(
    Object.entries(headers).filter(([key]) => whitelist.includes(key))
  );
}

const httpLogger = pinoHttp({
  logger,
  //   autoLogging: false,
  customLogLevel: () => "info",
  serializers: {
    req: (req) => ({
      id: req.id,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  customSuccessMessage: function (req, res) {
    const { method, url, id, query, params, headers } = req;
    const { statusCode } = res;
    // calculate response time correctly
    const responseTime = res.responseTime ?? (res.getHeaders ? 0 : 0);
    return `${method} ${url} id:"${id}" query:${JSON.stringify(
      query
    )} params:${JSON.stringify(params)} \nheaders:${JSON.stringify(
      filterHeaders(headers)
    )} res:{"statusCode":${statusCode}}`;
  },
});

module.exports = { logger, httpLogger };
