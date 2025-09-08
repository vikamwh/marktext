// Parallel processing utility with concurrency limits
export class ParallelProcessor {
  constructor (maxConcurrency = 5) {
    this.maxConcurrency = maxConcurrency
    this.running = 0
    this.queue = []
  }

  /**
   * Set the maximum number of concurrent operations
   * @param {number} max - Maximum concurrent operations
   */
  setMaxConcurrency (max) {
    this.maxConcurrency = Math.max(1, Math.min(20, max))
  }

  /**
   * Process an array of items with limited concurrency
   * @param {Array} items - Items to process
   * @param {Function} processor - Async function to process each item
   * @returns {Promise<Array>} Array of results (same order as input)
   */
  async processAll (items, processor) {
    if (!Array.isArray(items) || items.length === 0) {
      return []
    }

    const results = new Array(items.length)
    const promises = []

    for (let i = 0; i < items.length; i++) {
      const promise = this.process(() => processor(items[i], i))
        .then(result => {
          results[i] = { success: true, result }
        })
        .catch(error => {
          results[i] = { success: false, error }
        })

      promises.push(promise)
    }

    await Promise.all(promises)
    return results
  }

  /**
   * Process a single item with concurrency control
   * @param {Function} task - Async task to execute
   * @returns {Promise} Promise that resolves with task result
   */
  async process (task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject })
      this.processQueue()
    })
  }

  /**
   * Process the queue respecting concurrency limits
   */
  async processQueue () {
    if (this.running >= this.maxConcurrency || this.queue.length === 0) {
      return
    }

    this.running++
    const { task, resolve, reject } = this.queue.shift()

    try {
      const result = await task()
      resolve(result)
    } catch (error) {
      reject(error)
    } finally {
      this.running--

      // Process next item in queue
      if (this.queue.length > 0) {
        setImmediate(() => this.processQueue())
      }
    }
  }

  /**
   * Wait for all currently running tasks to complete
   * @returns {Promise} Promise that resolves when all running tasks complete
   */
  async waitForCompletion () {
    while (this.running > 0 || this.queue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  }

  /**
   * Get current status
   * @returns {Object} Status information
   */
  getStatus () {
    return {
      running: this.running,
      queued: this.queue.length,
      maxConcurrency: this.maxConcurrency
    }
  }
}

export default ParallelProcessor
