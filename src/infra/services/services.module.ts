import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { EnvModule } from '../env/env.module'
import { LogService } from './log/log.service'
import { OpenAiService } from './openai/openai.service'

@Module({
  imports: [DatabaseModule, EnvModule],
  providers: [OpenAiService, LogService],
  exports: [OpenAiService, LogService, DatabaseModule],
})
export class ServicesModule { }
