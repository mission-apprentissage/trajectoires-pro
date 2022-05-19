import { RateLimiter } from "./RateLimiter.js";
import { ApiError } from "./ApiError.js";
import bunyan from "../logger.js";

const logger = bunyan.child({ context: "api" });

class RateLimitedApi {
  constructor(name, options = {}) {
    this.name = name;
    this.rateLimiter = new RateLimiter(this.name, {
      nbRequests: options.nbRequests || 1,
      durationInSeconds: options.durationInSeconds || 1,
    });

    this.rateLimiter.on("status", ({ queueSize, maxQueueSize }) => {
      logger.trace(`${this.name} api queue status`, { queueSize, maxQueueSize });
      if (queueSize / maxQueueSize >= 0.8) {
        logger.warn(`${this.name} api queue is almost full : ${queueSize} / ${maxQueueSize}`);
      }
    });
  }

  async execute(callback) {
    try {
      return await this.rateLimiter.execute(callback);
    } catch (e) {
      throw new ApiError(this.name, e.message, e.response?.status || e.code, { cause: e });
    }
  }
}

export { RateLimitedApi };
