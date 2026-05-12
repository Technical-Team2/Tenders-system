import express from 'express'
import { QueueManager } from '../queue/queue.js'
import ScrapingPipeline from '../services/pipeline.js'

const router = express.Router()
const queueManager = new QueueManager()
const pipeline = new ScrapingPipeline()

function buildSourceConfig(sourceUrl, sourceId, selectors) {
  return {
    url: sourceUrl,
    sourceId,
    name: sourceId ? `Source ${sourceId}` : 'Manual Scrape',
    selectors: selectors || {
      title: { element: 'h1, .title, .tender-title', text: true },
      description: { element: '.description, .content, .tender-desc', text: true },
      deadline: { element: '.deadline, .closing-date, .due-date', text: true },
      organization: { element: '.organization, .company, .ministry', text: true },
      budget: { element: '.budget, .value, .amount', text: true }
    },
    companyUrl: null
  }
}

function formatScrapeResponse(sourceUrl, result) {
  if (result.success) {
    const tendersFound = result.count ?? result.tenders?.length ?? 0

    return {
      success: true,
      sourceUrl,
      source: result.source,
      tendersFound,
      tender: result.tender || result.tenders?.[0] || null,
      tenders: result.tenders || [],
      extractedCount: result.extractedCount ?? tendersFound,
      insertErrors: result.insertErrors || [],
      company: result.company,
      classification: result.classification,
      message: result.message,
      summary: result.message || `Successfully processed ${tendersFound} tender(s) from ${sourceUrl}`
    }
  }

  return {
    success: false,
    sourceUrl,
    source: result.source,
    error: result.error || result.message || result.reason || 'Failed to process tender',
    reason: result.reason,
    message: result.message,
    extractedCount: result.extractedCount,
    insertErrors: result.insertErrors || []
  }
}

// POST /api/scrape-tenders - Scrape tenders from a URL using production pipeline
router.post('/', async (req, res) => {
  try {
    const { sourceUrl, sourceId, selectors, urls } = req.body
    const sourceUrls = Array.isArray(urls) ? urls : (sourceUrl ? [sourceUrl] : [])

    if (sourceUrls.length === 0) {
      return res.status(400).json({ error: 'Source URL is required' })
    }

    if (sourceUrls.length > 1) {
      const results = await Promise.all(sourceUrls.map(async (url) => {
        try {
          const result = await pipeline.processTenderSource(buildSourceConfig(url, sourceId, selectors))
          return formatScrapeResponse(url, result)
        } catch (error) {
          console.error(`Production scraping error for ${url}:`, error)
          return {
            success: false,
            sourceUrl: url,
            error: error.message
          }
        }
      }))

      const successCount = results.filter(result => result.success).length
      return res.status(successCount > 0 ? 200 : 400).json({
        success: successCount > 0,
        sourceUrl: sourceUrls[0],
        sourcesCount: sourceUrls.length,
        successCount,
        failureCount: results.length - successCount,
        results,
        summary: `Processed ${sourceUrls.length} source(s): ${successCount} succeeded, ${results.length - successCount} failed`
      })
    }

    const sourceConfig = buildSourceConfig(sourceUrls[0], sourceId, selectors)
    const result = await pipeline.processTenderSource(sourceConfig)
    const responseBody = formatScrapeResponse(sourceUrls[0], result)

    res.status(result.success ? 200 : 400).json(responseBody)
  } catch (error) {
    console.error('Production scraping error:', error)
    res.status(500).json({
      success: false,
      sourceUrl: req.body?.sourceUrl,
      error: error.message
    })
  }
})

// POST /api/scrape-tenders/batch - Batch scrape multiple sources
router.post('/batch', async (req, res) => {
  try {
    const { sources } = req.body

    if (!sources || !Array.isArray(sources)) {
      return res.status(400).json({ error: 'Sources array is required' })
    }

    console.log(`Starting batch scrape for ${sources.length} sources`)
    
    // Add batch job to queue
    const job = await queueManager.addBatchScrapingJob(sources)
    
    res.json({
      success: true,
      jobId: job.id,
      sourcesCount: sources.length,
      message: `Batch scraping job queued: ${job.id}`
    })
  } catch (error) {
    console.error('Batch scraping error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// GET /api/scrape-tenders/status/:jobId - Get job status
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params
    
    const jobStatus = await queueManager.getJobStatus(jobId)
    
    res.json({
      success: true,
      jobStatus
    })
  } catch (error) {
    console.error('Job status error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// GET /api/scrape-tenders/queue-stats - Get queue statistics
router.get('/queue-stats', async (req, res) => {
  try {
    const stats = await queueManager.getQueueStats()
    
    res.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Queue stats error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// GET /api/scrape-tenders/history - Get job history
router.get('/history', async (req, res) => {
  try {
    const { limit = 20 } = req.query
    
    const history = await queueManager.getJobHistory(parseInt(limit))
    
    res.json({
      success: true,
      history
    })
  } catch (error) {
    console.error('Job history error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// POST /api/scrape-tenders/emergency - Emergency high-priority scraping
router.post('/emergency', async (req, res) => {
  try {
    const { sourceUrl, sourceId } = req.body

    if (!sourceUrl) {
      return res.status(400).json({ error: 'Source URL is required' })
    }

    console.log(`Starting emergency scrape for: ${sourceUrl}`)
    
    const sourceConfig = {
      url: sourceUrl,
      name: sourceId ? `Emergency ${sourceId}` : 'Emergency Scrape',
      selectors: {
        title: { element: 'h1, .title', text: true },
        description: { element: '.description, .content', text: true },
        deadline: { element: '.deadline, .closing-date', text: true },
        organization: { element: '.organization, .company', text: true },
        budget: { element: '.budget, .value', text: true }
      },
      companyUrl: null
    }

    // Add high-priority emergency job
    const job = await queueManager.addTenderScrapingJob(sourceConfig, {
      priority: 20,
      attempts: 5
    })
    
    res.json({
      success: true,
      jobId: job.id,
      sourceUrl,
      message: `Emergency scraping job queued: ${job.id}`
    })
  } catch (error) {
    console.error('Emergency scraping error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// POST /api/scrape-tenders/company - Scrape company information
router.post('/company', async (req, res) => {
  try {
    const { url, strategy = 'cheerio' } = req.body

    if (!url) {
      return res.status(400).json({ error: 'Company URL is required' })
    }

    console.log(`Scraping company info from: ${url}`)
    
    // Add company scraping job to queue
    const job = await queueManager.addCompanyScrapingJob(url, strategy)
    
    res.json({
      success: true,
      jobId: job.id,
      url,
      message: `Company scraping job queued: ${job.id}`
    })
  } catch (error) {
    console.error('Company scraping error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// GET /api/scrape-tenders/stats - Get scraping statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await pipeline.getScrapingStats()
    
    res.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Scraping stats error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// POST /api/scrape-tenders/cleanup - Clean up old logs
router.post('/cleanup', async (req, res) => {
  try {
    const { daysToKeep = 30 } = req.body
    
    console.log(`Cleaning up logs older than ${daysToKeep} days`)
    
    const deletedCount = await pipeline.cleanupOldLogs(daysToKeep)
    
    res.json({
      success: true,
      deletedCount,
      message: `Cleaned up ${deletedCount} old log entries`
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
