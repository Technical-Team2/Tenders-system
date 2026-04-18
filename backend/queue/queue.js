import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import ScrapingPipeline from '../services/pipeline.js';

// Redis connection
const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null
});

// Create scraping queue
const scrapingQueue = new Queue('scraping', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 20,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

// Create worker for processing jobs
const scrapingWorker = new Worker('scraping', async (job) => {
  const { type, data, options = {} } = job.data;
  const pipeline = new ScrapingPipeline();
  
  console.log(`Processing job ${job.id} of type: ${type}`);
  
  try {
    switch (type) {
      case 'tender_source':
        return await pipeline.processTenderSource(data);
        
      case 'batch_sources':
        return await pipeline.processBatch(data);
        
      case 'company_scrape':
        return await pipeline.companyScraper.scrapeCompany(data.url, data.strategy);
        
      case 'ai_process':
        switch (data.operation) {
          case 'clean':
            return await pipeline.aiProcessor.cleanData(data.text);
          case 'classify':
            return await pipeline.aiProcessor.classifyTender(data.tender);
          case 'enrich':
            return await pipeline.aiProcessor.enrichCompany(data.company);
          default:
            throw new Error(`Unknown AI operation: ${data.operation}`);
        }
        
      case 'cleanup':
        return await pipeline.cleanupOldLogs(options.daysToKeep);
        
      case 'stats':
        return await pipeline.getScrapingStats();
        
      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  } catch (error) {
    console.error(`Job ${job.id} failed:`, error.message);
    throw error;
  }
}, {
  connection: redisConnection,
  concurrency: 3, // Process 3 jobs concurrently
  limiter: {
    max: 10,
    duration: 60000 // 10 jobs per minute
  }
});

// Worker event listeners
scrapingWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

scrapingWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

scrapingWorker.on('error', (err) => {
  console.error('Worker error:', err);
});

// Queue event listeners
scrapingQueue.on('waiting', (job) => {
  console.log(`Job ${job.id} is waiting`);
});

scrapingQueue.on('active', (job) => {
  console.log(`Job ${job.id} is now active`);
});

scrapingQueue.on('stalled', (job) => {
  console.warn(`Job ${job.id} is stalled`);
});

// Job management functions
class QueueManager {
  constructor() {
    this.queue = scrapingQueue;
    this.worker = scrapingWorker;
  }

  async addTenderScrapingJob(sourceConfig, options = {}) {
    const job = await this.queue.add('tender_source', sourceConfig, {
      priority: 10,
      delay: options.delay || 0,
      attempts: options.attempts || 3,
      backoff: options.backoff || {
        type: 'exponential',
        delay: 2000
      }
    });

    console.log(`Added tender scraping job: ${job.id}`);
    return job;
  }

  async addBatchScrapingJob(sources, options = {}) {
    const job = await this.queue.add('batch_sources', sources, {
      priority: 5,
      delay: options.delay || 0,
      attempts: options.attempts || 2,
      backoff: options.backoff || {
        type: 'exponential',
        delay: 5000
      }
    });

    console.log(`Added batch scraping job: ${job.id}`);
    return job;
  }

  async addCompanyScrapingJob(url, strategy = 'cheerio', options = {}) {
    const job = await this.queue.add('company_scrape', { url, strategy }, {
      priority: 8,
      delay: options.delay || 0,
      attempts: options.attempts || 2
    });

    console.log(`Added company scraping job: ${job.id}`);
    return job;
  }

  async addAIProcessingJob(operation, data, options = {}) {
    const job = await this.queue.add('ai_process', { operation, data }, {
      priority: 7,
      delay: options.delay || 0,
      attempts: options.attempts || 2
    });

    console.log(`Added AI processing job: ${job.id}`);
    return job;
  }

  async addCleanupJob(daysToKeep = 30, options = {}) {
    const job = await this.queue.add('cleanup', {}, {
      priority: 1,
      delay: options.delay || 0,
      attempts: 1
    });

    console.log(`Added cleanup job: ${job.id}`);
    return job;
  }

  async getJobStatus(jobId) {
    const job = await this.queue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const state = await job.getState();
    const progress = job.progress;
    
    return {
      id: job.id,
      data: job.data,
      state,
      progress,
      createdAt: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
      returnvalue: job.returnvalue
    };
  }

  async getQueueStats() {
    const waiting = await this.queue.getWaiting();
    const active = await this.queue.getActive();
    const completed = await this.queue.getCompleted();
    const failed = await this.queue.getFailed();
    const delayed = await this.queue.getDelayed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      total: waiting.length + active.length + completed.length + failed.length + delayed.length
    };
  }

  async pauseQueue() {
    await this.worker.pause();
    console.log('Queue paused');
  }

  async resumeQueue() {
    await this.worker.resume();
    console.log('Queue resumed');
  }

  async clearQueue() {
    await this.queue.clean(0, 'completed');
    await this.queue.clean(0, 'failed');
    console.log('Queue cleaned');
  }

  async removeJob(jobId) {
    const job = await this.queue.getJob(jobId);
    if (job) {
      await job.remove();
      console.log(`Job ${jobId} removed`);
    }
  }

  async retryJob(jobId) {
    const job = await this.queue.getJob(jobId);
    if (job) {
      await job.retry();
      console.log(`Job ${jobId} retried`);
    }
  }

  async getJobHistory(limit = 50) {
    const completed = await this.queue.getCompleted(0, limit);
    const failed = await this.queue.getFailed(0, limit);

    return {
      completed: completed.map(job => ({
        id: job.id,
        data: job.data,
        finishedOn: job.finishedOn,
        returnvalue: job.returnvalue
      })),
      failed: failed.map(job => ({
        id: job.id,
        data: job.data,
        failedReason: job.failedReason,
        finishedOn: job.finishedOn
      }))
    };
  }

  async close() {
    await this.worker.close();
    await this.queue.close();
    await redisConnection.quit();
    console.log('Queue and connections closed');
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down queue...');
  await scrapingWorker.close();
  await scrapingQueue.close();
  await redisConnection.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down queue...');
  await scrapingWorker.close();
  await scrapingQueue.close();
  await redisConnection.quit();
  process.exit(0);
});

export {
  QueueManager,
  scrapingQueue,
  scrapingWorker,
  redisConnection
};
