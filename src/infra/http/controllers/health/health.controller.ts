import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { HealthResponseDto } from '../../dtos/health/health-response.dto'

@ApiTags('health')
@Controller('health')
export class HealthController {
	@Get()
	@ApiOperation({ summary: 'Health check endpoint' })
	@ApiResponse({
		status: 200,
		description: 'Application is healthy',
		type: HealthResponseDto,
	})
	check() {
		return {
			status: 'ok',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			environment: process.env.NODE_ENV || 'development',
		}
	}
}
