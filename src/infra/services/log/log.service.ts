import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../database/prisma/prisma.service'

export interface LogData {
  ip?: string
  userAgent?: string
  requestId?: string
  duration?: number
  statusCode?: number
  method?: string
  url?: string
  requestBody?: any
}

@Injectable()
export class LogService {
  private readonly logger = new Logger(LogService.name)

  constructor(private readonly prisma: PrismaService) { }

  async log(
    level: 'INFO' | 'WARN' | 'ERROR',
    message: string,
    data?: LogData
  ): Promise<void> {
    try {
      await this.prisma.log.create({
        data: {
          level,
          message,
          metadata: data ? JSON.parse(JSON.stringify(data)) : null,
          ip: data?.ip,
          userAgent: data?.userAgent,
          requestId: data?.requestId,
          duration: data?.duration,
          statusCode: data?.statusCode,
          method: data?.method,
          url: data?.url,
          requestBody: data?.requestBody ? JSON.parse(JSON.stringify(data.requestBody)) : null,
        },
      })
    } catch (error) {
      this.logger.error('Failed to save log to database', error)
    }
  }

  async getLogs(
    level?: string,
    limit = 100,
    offset = 0
  ): Promise<any[]> {
    try {
      return await this.prisma.log.findMany({
        where: level ? { level } : undefined,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      })
    } catch (error) {
      this.logger.error('Failed to retrieve logs from database', error)
      return []
    }
  }

  async deleteOldLogs(daysOld = 30): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const result = await this.prisma.log.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      })

      this.logger.log(`Deleted ${result.count} old logs`)
      return result.count
    } catch (error) {
      this.logger.error('Failed to delete old logs', error)
      return 0
    }
  }
}
