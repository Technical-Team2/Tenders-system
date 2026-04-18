import cron from 'node-cron';
import { QueueManager } from '../queue/queue.js';

class ScrapingScheduler {
  constructor() {
    this.queueManager = new QueueManager();
    this.jobs = new Map();
    this.isRunning = false;
  }

  // Default tender sources configuration
  getDefaultSources() {
    return [
      {
        name: 'Government Procurement Portal',
        url: 'https://example-government-procurement.gov.tz/tenders',
        selectors: {
          title: { element: '.tender-title', text: true },
          description: { element: '.tender-description', text: true },
          deadline: { element: '.deadline', text: true },
          organization: { element: '.organization', text: true },
          budget: { element: '.budget', text: true },
          link: { element: '.tender-link', attr: 'href' }
        },
        companyUrl: null
      },
      {
        name: 'Public Works Tenders',
        url: 'https://example-public-works.go.tz/procurement',
        selectors: {
          title: { element: 'h3.tender', text: true },
          description: { element: '.description', text: true },
          deadline: { element: '.closing-date', text: true },
          organization: { element: '.ministry', text: true },
          budget: { element: '.value', text: true },
          link: { element: '.view-details', attr: 'href' }
        },
        companyUrl: null
      },
      {
        name: 'Health Ministry Tenders',
        url: 'https://example-health.go.tz/opportunities',
        selectors: {
          title: { element: '.opportunity-title', text: true },
          description: { element: '.opportunity-desc', text: true },
          deadline: { element: '.submission-deadline', text: true },
          organization: { element: '.department', text: true },
          budget: { element: '.estimated-cost', text: true },
          link: { element: '.apply-link', attr: 'href' }
        },
        companyUrl: null
      }
    ];
  }

  // Schedule scraping every 30 minutes
  scheduleRegularScraping() {
    const job = cron.schedule('*/30 * * * *', async () => {
      console.log('Starting scheduled scraping job...');
      await this.runScheduledScraping();
    }, {
      scheduled: false,
      timezone: 'Africa/Dar_es_Salaam'
    });

    this.jobs.set('regular', job);
    console.log('Regular scraping scheduled (every 30 minutes)');
    return job;
  }

  // Schedule deep scraping every 6 hours
  scheduleDeepScraping() {
    const job = cron.schedule('0 */6 * * *', async () => {
      console.log('Starting deep scraping job...');
      await this.runDeepScraping();
    }, {
      scheduled: false,
      timezone: 'Africa/Dar_es_Salaam'
    });

    this.jobs.set('deep', job);
    console.log('Deep scraping scheduled (every 6 hours)');
    return job;
  }

  // Schedule cleanup daily at 2 AM
  scheduleCleanup() {
    const job = cron.schedule('0 2 * * *', async () => {
      console.log('Starting cleanup job...');
      await this.runCleanup();
    }, {
      scheduled: false,
      timezone: 'Africa/Dar_es_Salaam'
    });

    this.jobs.set('cleanup', job);
    console.log('Cleanup scheduled (daily at 2 AM)');
    return job;
  }

  // Schedule stats collection every hour
  scheduleStatsCollection() {
    const job = cron.schedule('0 * * * *', async () => {
      console.log('Collecting scraping stats...');
      await this.collectStats();
    }, {
      scheduled: false,
      timezone: 'Africa/Dar_es_Salaam'
    });

    this.jobs.set('stats', job);
    console.log('Stats collection scheduled (every hour)');
    return job;
  }

  async runScheduledScraping() {
    if (this.isRunning) {
      console.log('Scraping already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    
    try {
      const sources = this.getDefaultSources();
      
      // Add sources to queue with staggered delays
      for (let i = 0; i < sources.length; i++) {
        const source = sources[i];
        const delay = i * 5000; // 5 second stagger between sources
        
        await this.queueManager.addTenderScrapingJob(source, {
          delay,
          attempts: 3
        });
        
        console.log(`Queued scraping for ${source.name} with ${delay}ms delay`);
      }

      console.log(`Scheduled ${sources.length} sources for scraping`);
    } catch (error) {
      console.error('Error in scheduled scraping:', error.message);
    } finally {
      this.isRunning = false;
    }
  }

  async runDeepScraping() {
    if (this.isRunning) {
      console.log('Scraping already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    
    try {
      const sources = this.getDefaultSources();
      
      // Add batch job for deep scraping
      await this.queueManager.addBatchScrapingJob(sources, {
        delay: 0,
        attempts: 2
      });

      console.log('Scheduled deep batch scraping');
    } catch (error) {
      console.error('Error in deep scraping:', error.message);
    } finally {
      this.isRunning = false;
    }
  }

  async runCleanup() {
    try {
      await this.queueManager.addCleanupJob(30, {
        delay: 0
      });

      console.log('Scheduled cleanup job');
    } catch (error) {
      console.error('Error in cleanup:', error.message);
    }
  }

  async collectStats() {
    try {
      await this.queueManager.addAIProcessingJob('stats', {}, {
        delay: 0
      });

      console.log('Scheduled stats collection');
    } catch (error) {
      console.error('Error in stats collection:', error.message);
    }
  }

  // Start all scheduled jobs
  startAll() {
    console.log('Starting all scheduled jobs...');
    
    this.scheduleRegularScraping();
    this.scheduleDeepScraping();
    this.scheduleCleanup();
    this.scheduleStatsCollection();

    // Start all jobs
    this.jobs.forEach((job, name) => {
      job.start();
      console.log(`Started job: ${name}`);
    });

    console.log('All scheduled jobs started');
  }

  // Stop all scheduled jobs
  stopAll() {
    console.log('Stopping all scheduled jobs...');
    
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`Stopped job: ${name}`);
    });

    console.log('All scheduled jobs stopped');
  }

  // Start specific job
  startJob(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.start();
      console.log(`Started job: ${jobName}`);
    } else {
      console.error(`Job not found: ${jobName}`);
    }
  }

  // Stop specific job
  stopJob(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      console.log(`Stopped job: ${jobName}`);
    } else {
      console.error(`Job not found: ${jobName}`);
    }
  }

  // Get job status
  getJobStatus(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      return {
        name: jobName,
        running: job.running,
        scheduled: job.scheduled,
        lastExecution: job.lastExecution,
        nextExecution: job.nextExecution
      };
    } else {
      return null;
    }
  }

  // Get all job statuses
  getAllJobStatuses() {
    const statuses = {};
    this.jobs.forEach((job, name) => {
      statuses[name] = {
        running: job.running,
        scheduled: job.scheduled,
        lastExecution: job.lastExecution,
        nextExecution: job.nextExecution
      };
    });
    return statuses;
  }

  // Add custom scraping job
  async addCustomScrapingJob(sourceConfig, schedulePattern = null) {
    if (schedulePattern) {
      const job = cron.schedule(schedulePattern, async () => {
        await this.queueManager.addTenderScrapingJob(sourceConfig);
      }, {
        scheduled: false,
        timezone: 'Africa/Dar_es_Salaam'
      });

      const jobName = `custom_${Date.now()}`;
      this.jobs.set(jobName, job);
      job.start();

      console.log(`Custom scraping job scheduled: ${jobName} with pattern: ${schedulePattern}`);
      return jobName;
    } else {
      // One-time job
      await this.queueManager.addTenderScrapingJob(sourceConfig);
      console.log('One-time scraping job added to queue');
    }
  }

  // Add emergency scraping (high priority)
  async addEmergencyScraping(sourceConfig) {
    await this.queueManager.addTenderScrapingJob(sourceConfig, {
      priority: 20, // Higher priority
      delay: 0,
      attempts: 5 // More attempts
    });

    console.log('Emergency scraping job added with high priority');
  }

  // Get queue statistics
  async getQueueStats() {
    return await this.queueManager.getQueueStats();
  }

  // Get job history
  async getJobHistory(limit = 20) {
    return await this.queueManager.getJobHistory(limit);
  }

  // Graceful shutdown
  async shutdown() {
    console.log('Shutting down scraping scheduler...');
    
    this.stopAll();
    
    // Wait for current jobs to finish (max 30 seconds)
    let attempts = 0;
    while (this.isRunning && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (this.isRunning) {
      console.warn('Forcing shutdown - some jobs may still be running');
    }

    await this.queueManager.close();
    console.log('Scraping scheduler shutdown complete');
  }
}

// Create and export scheduler instance
const scheduler = new ScrapingScheduler();

// Auto-start if not in test environment
if (process.env.NODE_ENV !== 'test') {
  scheduler.startAll();
}

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down scheduler...');
  await scheduler.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down scheduler...');
  await scheduler.shutdown();
  process.exit(0);
});

export default ScrapingScheduler;
