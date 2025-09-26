import { EnvService } from '@/infra/env/env.service'
import { Injectable, OnModuleDestroy } from '@nestjs/common'
import Redis, { } from 'ioredis'

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor(envService: EnvService) {
    super(envService.get('REDIS_URL'))
  }

  onModuleDestroy() {
    this.disconnect()
  }
}
