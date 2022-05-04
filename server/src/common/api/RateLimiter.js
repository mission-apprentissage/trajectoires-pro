const { RateLimiterMemory, RateLimiterQueue } = require("rate-limiter-flexible");
const { EventEmitter } = require("events");

class RateLimiter extends EventEmitter {
  constructor(name, options = {}) {
    super();
    this.name = name;
    this.maxQueueSize = options.maxQueueSize || 25;
    this.options = options;

    let memoryRateLimiter = new RateLimiterMemory({
      keyPrefix: name,
      points: options.nbRequests || 1,
      duration: options.durationInSeconds || 1,
    });

    this.queue = new RateLimiterQueue(memoryRateLimiter, { maxQueueSize: this.maxQueueSize });
  }

  async execute(callback) {
    await this.queue.removeTokens(1);
    this.emit("status", {
      queueSize: this.queue._queueLimiters.limiter._queue.length,
      maxQueueSize: this.maxQueueSize,
    });
    return callback();
  }
}

module.exports = RateLimiter;
