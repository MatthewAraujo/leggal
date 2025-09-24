import { Module } from '@nestjs/common'
import { OpenAiService } from './openai/openai.service'
import { LogService } from './log/log.service'
import { DatabaseModule } from '../database/database.module'
import { EnvModule } from '../env/env.module'

@Module({
  imports: [DatabaseModule, EnvModule],
  providers: [OpenAiService, LogService],
  exports: [OpenAiService, LogService, DatabaseModule],
})
export class ServicesModule { }