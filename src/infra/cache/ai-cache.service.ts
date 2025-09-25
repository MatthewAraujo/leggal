import { Injectable } from '@nestjs/common'
import { CacheRepository } from './cache-repository'
import { createHash } from 'node:crypto'

export interface AICacheEntry {
  prompt: string
  response: string
  timestamp: number
  ttl: number
}

@Injectable()
export class AICacheService {
  private readonly DEFAULT_TTL = 3600 // 1 hora em segundos
  private readonly CACHE_PREFIX = 'ai_cache:'

  constructor(private readonly cacheRepository: CacheRepository) { }

  private generateCacheKey(prompt: string): string {
    const hash = createHash('sha256').update(prompt).digest('hex')
    return `${this.CACHE_PREFIX}${hash}`
  }

  async getCachedResponse(prompt: string): Promise<string | null> {
    const cacheKey = this.generateCacheKey(prompt)
    const cached = await this.cacheRepository.get<AICacheEntry>(cacheKey)

    if (!cached) {
      return null
    }

    try {
      const entry: AICacheEntry = JSON.parse(cached)

      // Verificar se o cache ainda é válido
      const now = Date.now()
      const isExpired = (now - entry.timestamp) > (entry.ttl * 1000)

      if (isExpired) {
        await this.cacheRepository.delete(cacheKey)
        return null
      }

      return entry.response
    } catch (error) {
      // Se houver erro ao fazer parse, remove o cache corrompido
      await this.cacheRepository.delete(cacheKey)
      return null
    }
  }

  async setCachedResponse(
    prompt: string,
    response: string,
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(prompt)
    const entry: AICacheEntry = {
      prompt,
      response,
      timestamp: Date.now(),
      ttl
    }

    await this.cacheRepository.set(cacheKey, JSON.stringify(entry), ttl)
  }

  async invalidateCache(prompt: string): Promise<void> {
    const cacheKey = this.generateCacheKey(prompt)
    await this.cacheRepository.delete(cacheKey)
  }

  async clearAllAICache(): Promise<void> {
    // Esta implementação seria específica do Redis para limpar por padrão
    // Por enquanto, deixamos como placeholder
    // Em uma implementação real, você usaria SCAN para encontrar todas as chaves com prefixo
    throw new Error('clearAllAICache not implemented - requires Redis SCAN operation')
  }
}
