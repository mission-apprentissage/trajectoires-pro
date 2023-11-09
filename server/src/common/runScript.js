import { closeMongodbConnection, connectToMongodb } from "./db/mongodb.js";
import prettyMilliseconds from "pretty-ms";
import { isEmpty } from "lodash-es";
import { getLoggerWithContext } from "./logger.js";

const logger = getLoggerWithContext("script");

process.on("unhandledRejection", (e) => logger.error(e));
process.on("uncaughtException", (e) => logger.error(e));
process.stdout.on("error", function (err) {
  if (err.code === "EPIPE") {
    // eslint-disable-next-line no-process-exit
    process.exit(0);
  }
});

const createTimer = () => {
  let launchTime;
  return {
    start: () => {
      launchTime = new Date().getTime();
    },
    stop: (results) => {
      const duration = prettyMilliseconds(new Date().getTime() - launchTime);
      const data = results && results.toJSON ? results.toJSON() : results;
      if (!isEmpty(data)) {
        logger.info(JSON.stringify(data, null, 2));
      }
      logger.info(`Completed in ${duration}`);
    },
  };
};

const exit = async (scriptError) => {
  if (scriptError) {
    logger.error(scriptError.constructor.name === "EnvVarError" ? scriptError.message : scriptError);
    process.exitCode = 1;
  }

  setTimeout(() => {
    //Waiting logger to flush all logs (MongoDB)
    closeMongodbConnection().catch((e) => {
      console.error(e);
      process.exitCode = 1;
    });
  }, 250);
};

const wrapTimer = async (cb) => {
  const timer = createTimer();
  timer.start();
  const results = await cb();
  timer.stop(results);
};

async function runScript(job, options = { withTimer: true }) {
  const withTimer = options.withTimer ?? true;
  try {
    const cb = async () => {
      await connectToMongodb();
      return await job();
    };

    withTimer ? await wrapTimer(cb) : await cb();
    await exit();
  } catch (e) {
    await exit(e);
  }
}

export { runScript };
