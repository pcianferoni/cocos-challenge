import { Logger } from '@nestjs/common';

const logger = new Logger('requestLogger');

export const requestLogger = (req, res, next) => {
  if (req.url === '/' || req.url.startsWith('/docs')) {
    return next();
  }

  const startTime = Date.now();

  const originalSend = res.send;

  let requestLogged = false;

  res.send = function (body) {
    if (!requestLogged) {
      const responseTime = Date.now() - startTime;

      logger.log({
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        response: {
          status: res.statusCode,
          body: body,
        },
        user: req.user,
        responseTime: responseTime + 'ms',
      });

      requestLogged = true;
    }

    originalSend.call(res, body);
  };

  next();
};
