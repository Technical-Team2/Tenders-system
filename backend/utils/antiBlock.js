const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.59',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
  'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
];

const getRandomUserAgent = () => {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const randomDelay = (min = 1000, max = 5000) => {
  const delayMs = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(delayMs);
};

const retry = async (fn, maxRetries = 3, context = '') => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed${context ? ` for ${context}` : ''}: ${error.message}`);
      
      if (attempt < maxRetries) {
        // Exponential backoff with jitter
        const baseDelay = Math.pow(2, attempt - 1) * 1000;
        const jitter = Math.random() * 1000;
        const delayMs = baseDelay + jitter;
        
        console.log(`Retrying in ${Math.round(delayMs)}ms...`);
        await delay(delayMs);
      }
    }
  }
  
  throw new Error(`All ${maxRetries} attempts failed${context ? ` for ${context}` : ''}. Last error: ${lastError.message}`);
};

const exponentialBackoff = (attempt, baseDelay = 1000, maxDelay = 30000) => {
  const delayMs = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = Math.random() * 1000;
  return delayMs + jitter;
};

const rateLimit = {
  requests: new Map(),
  
  async check(key, limit = 10, windowMs = 60000) {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
    
    if (validRequests.length >= limit) {
      const oldestRequest = Math.min(...validRequests);
      const waitTime = windowMs - (now - oldestRequest);
      
      console.log(`Rate limit exceeded for ${key}. Waiting ${waitTime}ms`);
      await delay(waitTime);
      
      // Recursively check after waiting
      return this.check(key, limit, windowMs);
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
};

const proxyRotator = {
  proxies: [
    // Add proxy configurations here if needed
    // { host: 'proxy1.com', port: 8080, auth: { username: 'user', password: 'pass' } }
  ],
  
  getRandomProxy() {
    if (this.proxies.length === 0) return null;
    return this.proxies[Math.floor(Math.random() * this.proxies.length)];
  }
};

const headers = {
  getCommonHeaders() {
    return {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    };
  },
  
  getApiHeaders() {
    return {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Content-Type': 'application/json',
      'DNT': '1',
      'Connection': 'keep-alive'
    };
  }
};

const captchaDetector = {
  detectCaptcha(html) {
    const captchaIndicators = [
      /captcha/i,
      /recaptcha/i,
      /hcaptcha/i,
      /cf-browser-verification/i,
      /cloudflare/i,
      /security check/i,
      /verify you're human/i,
      /prove you're not a robot/i
    ];
    
    return captchaIndicators.some(indicator => indicator.test(html));
  },
  
  getCaptchaType(html) {
    if (/recaptcha/i.test(html)) return 'recaptcha';
    if (/hcaptcha/i.test(html)) return 'hcaptcha';
    if (/cloudflare/i.test(html)) return 'cloudflare';
    if (/cf-browser-verification/i.test(html)) return 'cloudflare';
    return 'unknown';
  }
};

const browserFingerprint = {
  generate() {
    return {
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      webdriver: navigator.webdriver
    };
  }
};

const sessionManager = {
  sessions: new Map(),
  
  createSession(key) {
    const session = {
      id: Math.random().toString(36).substr(2, 9),
      userAgent: getRandomUserAgent(),
      cookies: new Map(),
      headers: { ...headers.getCommonHeaders() },
      createdAt: Date.now(),
      lastUsed: Date.now()
    };
    
    this.sessions.set(key, session);
    return session;
  },
  
  getSession(key) {
    const session = this.sessions.get(key);
    if (session) {
      session.lastUsed = Date.now();
      return session;
    }
    return this.createSession(key);
  },
  
  cleanupOldSessions(maxAge = 3600000) { // 1 hour
    const now = Date.now();
    for (const [key, session] of this.sessions.entries()) {
      if (now - session.lastUsed > maxAge) {
        this.sessions.delete(key);
      }
    }
  }
};

const concurrencyController = {
  activeRequests: 0,
  maxConcurrent: 5,
  queue: [],
  
  async execute(fn) {
    return new Promise((resolve, reject) => {
      const executeRequest = async () => {
        this.activeRequests++;
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeRequests--;
          this.processQueue();
        }
      };
      
      if (this.activeRequests < this.maxConcurrent) {
        executeRequest();
      } else {
        this.queue.push(executeRequest);
      }
    });
  },
  
  processQueue() {
    if (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const nextRequest = this.queue.shift();
      nextRequest();
    }
  }
};

export {
  getRandomUserAgent,
  delay,
  randomDelay,
  retry,
  exponentialBackoff,
  rateLimit,
  proxyRotator,
  headers,
  captchaDetector,
  browserFingerprint,
  sessionManager,
  concurrencyController
};
