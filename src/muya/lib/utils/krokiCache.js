// Persistent disk cache for Kroki diagrams with hash-based invalidation
import { createHash } from 'crypto'
import { join } from 'path'
import { promises as fs } from 'fs'
import { homedir } from 'os'

const CACHE_DIR = join(homedir(), '.marktext', 'kroki-cache')
const CACHE_VERSION = '1.0'
const MAX_CACHE_SIZE_MB = 100 // Maximum cache size in MB
const CACHE_CLEANUP_THRESHOLD = 0.8 // Cleanup when cache reaches 80% of max size

class KrokiCache {
  constructor () {
    this.memoryCache = new Map()
    this.initialized = false
  }

  async initialize () {
    if (this.initialized) return

    try {
      await fs.mkdir(CACHE_DIR, { recursive: true })
      this.initialized = true

      // Perform cleanup on initialization
      await this.cleanupIfNeeded()
    } catch (error) {
      console.warn('Failed to initialize Kroki cache directory:', error)
      this.initialized = false
    }
  }

  /**
   * Generate a stable hash for diagram content and type
   * @param {string} diagramType - The diagram type (mermaid, plantuml, etc.)
   * @param {string} code - The diagram source code
   * @returns {string} SHA-256 hash
   */
  generateHash (diagramType, code) {
    const content = `${CACHE_VERSION}:${diagramType}:${code.trim()}`
    return createHash('sha256').update(content, 'utf8').digest('hex')
  }

  /**
   * Get cached diagram SVG if available
   * @param {string} diagramType - The diagram type
   * @param {string} code - The diagram source code
   * @returns {Promise<string|null>} SVG content or null if not cached
   */
  async get (diagramType, code) {
    const hash = this.generateHash(diagramType, code)

    // Check memory cache first
    if (this.memoryCache.has(hash)) {
      return this.memoryCache.get(hash)
    }

    if (!this.initialized) {
      await this.initialize()
    }

    if (!this.initialized) {
      return null // Cache not available
    }

    try {
      const cacheFile = join(CACHE_DIR, `${hash}.svg`)
      const content = await fs.readFile(cacheFile, 'utf8')

      // Update memory cache
      this.memoryCache.set(hash, content)

      // Update access time for LRU cleanup
      await fs.utimes(cacheFile, new Date(), new Date()).catch(() => {
        // Ignore errors updating access time
      })

      return content
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn('Error reading from Kroki cache:', error)
      }
      return null
    }
  }

  /**
   * Store diagram SVG in cache
   * @param {string} diagramType - The diagram type
   * @param {string} code - The diagram source code
   * @param {string} svg - The SVG content to cache
   */
  async set (diagramType, code, svg) {
    const hash = this.generateHash(diagramType, code)

    // Update memory cache
    this.memoryCache.set(hash, svg)

    if (!this.initialized) {
      await this.initialize()
    }

    if (!this.initialized) {
      return // Cache not available
    }

    try {
      const cacheFile = join(CACHE_DIR, `${hash}.svg`)
      await fs.writeFile(cacheFile, svg, 'utf8')

      // Cleanup if cache is getting too large
      await this.cleanupIfNeeded()
    } catch (error) {
      console.warn('Error writing to Kroki cache:', error)
    }
  }

  /**
   * Check if cache cleanup is needed and perform it
   */
  async cleanupIfNeeded () {
    if (!this.initialized) return

    try {
      const stats = await this.getCacheStats()
      const currentSizeMB = stats.totalSize / (1024 * 1024)

      if (currentSizeMB > MAX_CACHE_SIZE_MB * CACHE_CLEANUP_THRESHOLD) {
        await this.cleanup()
      }
    } catch (error) {
      console.warn('Error during cache cleanup check:', error)
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats () {
    if (!this.initialized) return { totalSize: 0, fileCount: 0 }

    try {
      const files = await fs.readdir(CACHE_DIR)
      const svgFiles = files.filter(f => f.endsWith('.svg'))

      let totalSize = 0
      const fileStats = []

      for (const file of svgFiles) {
        try {
          const filePath = join(CACHE_DIR, file)
          const stat = await fs.stat(filePath)
          totalSize += stat.size
          fileStats.push({
            file,
            path: filePath,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime
          })
        } catch (error) {
          // File might have been deleted, skip
        }
      }

      return {
        totalSize,
        fileCount: fileStats.length,
        files: fileStats
      }
    } catch (error) {
      console.warn('Error getting cache stats:', error)
      return { totalSize: 0, fileCount: 0, files: [] }
    }
  }

  /**
   * Cleanup old cache files using LRU strategy
   */
  async cleanup () {
    if (!this.initialized) return

    try {
      const stats = await this.getCacheStats()
      const targetSizeMB = MAX_CACHE_SIZE_MB * 0.5 // Clean up to 50% of max size
      const targetSize = targetSizeMB * 1024 * 1024

      // Sort files by access time (oldest first)
      const sortedFiles = stats.files.sort((a, b) => a.atime - b.atime)

      let currentSize = stats.totalSize
      const filesToDelete = []

      for (const fileInfo of sortedFiles) {
        if (currentSize <= targetSize) break

        filesToDelete.push(fileInfo)
        currentSize -= fileInfo.size
      }

      // Delete old files
      for (const fileInfo of filesToDelete) {
        try {
          await fs.unlink(fileInfo.path)

          // Remove from memory cache if present
          const hash = fileInfo.file.replace('.svg', '')
          this.memoryCache.delete(hash)
        } catch (error) {
          console.warn(`Error deleting cache file ${fileInfo.file}:`, error)
        }
      }

      if (filesToDelete.length > 0) {
        console.log(`Kroki cache cleanup: removed ${filesToDelete.length} files, freed ${Math.round((stats.totalSize - currentSize) / (1024 * 1024) * 100) / 100} MB`)
      }
    } catch (error) {
      console.warn('Error during cache cleanup:', error)
    }
  }

  /**
   * Clear all cache (memory and disk)
   */
  async clear () {
    // Clear memory cache
    this.memoryCache.clear()

    if (!this.initialized) {
      await this.initialize()
    }

    if (!this.initialized) return

    try {
      const files = await fs.readdir(CACHE_DIR)
      const svgFiles = files.filter(f => f.endsWith('.svg'))

      for (const file of svgFiles) {
        try {
          await fs.unlink(join(CACHE_DIR, file))
        } catch (error) {
          console.warn(`Error deleting cache file ${file}:`, error)
        }
      }

      console.log('Kroki cache cleared')
    } catch (error) {
      console.warn('Error clearing cache:', error)
    }
  }
}

// Export singleton instance
export const krokiCache = new KrokiCache()
export default krokiCache
