import { CacheRepository } from '@/infra/cache/cache-repository'

export class InMemoryCacheRepository implements CacheRepository {
	private cache = new Map<string, { value: string; expiresAt?: number }>()

	async set(key: string, value: string, ttl?: number): Promise<void> {
		const expiresAt = ttl ? Date.now() + ttl * 1000 : undefined
		this.cache.set(key, { value, expiresAt })
	}

	async get(key: string): Promise<string | null> {
		const item = this.cache.get(key)

		if (!item) {
			return null
		}

		// Verifica se o item expirou
		if (item.expiresAt && Date.now() > item.expiresAt) {
			this.cache.delete(key)
			return null
		}

		return item.value
	}

	async delete(key: string): Promise<void> {
		this.cache.delete(key)
	}
}
