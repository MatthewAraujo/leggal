import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { LogService } from './log.service'

@Module({
  imports: [DatabaseModule],
  providers: [LogService],
  exports: [LogService],
})
export class LogModule { }
