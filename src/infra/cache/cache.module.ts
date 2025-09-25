import { Module } from '@nestjs/common'
import { EnvModule } from '../env/env.module'
import { CacheRepository } from './cache-repository'
import { RedisCacheRepository } from './redis/redis-cache-repository'
import { RedisService } from './redis/redis.service'
import { AICacheService } from './ai-cache.service'

@Module({
	imports: [EnvModule],
	providers: [
		RedisService,
		{
			provide: CacheRepository,
			useClass: RedisCacheRepository,
		},
		AICacheService,
	],
	exports: [CacheRepository, AICacheService],
})
export class CacheModule { }
