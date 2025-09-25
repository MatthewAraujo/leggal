import { Test, TestingModule } from '@nestjs/testing'
import { LogService } from '../services/log/log.service'
import { LoggerMiddleware } from './logger.middleware'

describe('LoggerMiddleware', () => {
	let middleware: LoggerMiddleware
	let logService: LogService

	const mockLogService = {
		log: vi.fn(() => Promise.resolve()),
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				LoggerMiddleware,
				{
					provide: LogService,
					useValue: mockLogService,
				},
			],
		}).compile()

		middleware = module.get<LoggerMiddleware>(LoggerMiddleware)
		logService = module.get<LogService>(LogService)
	})

	it('should be defined', () => {
		expect(middleware).toBeDefined()
	})

	it('should log request and response', () => {
		const mockReq = {
			method: 'GET',
			originalUrl: '/test',
			ip: '127.0.0.1',
			headers: { 'user-agent': 'test-agent' },
			body: {},
		} as any

		const mockRes = {
			statusCode: 200,
			end: vi.fn(),
		} as any

		const mockNext = vi.fn()

		middleware.use(mockReq, mockRes, mockNext)

		expect(mockNext).toHaveBeenCalled()
		expect(mockRes.end).toBeDefined()
	})

	it('should sanitize sensitive data in request body', () => {
		const mockReq = {
			method: 'POST',
			originalUrl: '/test',
			ip: '127.0.0.1',
			headers: { 'user-agent': 'test-agent' },
			body: {
				username: 'test',
				password: 'secret123',
				token: 'abc123',
				normalField: 'value',
			},
		} as any

		const mockRes = {
			statusCode: 200,
			end: vi.fn(),
		} as any

		const mockNext = vi.fn()

		middleware.use(mockReq, mockRes, mockNext)

		// Simulate response end
		mockRes.end()

		expect(mockNext).toHaveBeenCalled()
		expect(logService.log).toHaveBeenCalledWith(
			'INFO',
			expect.stringMatching(/.*/),
			expect.objectContaining({
				requestBody: expect.objectContaining({
					username: 'test',
					password: '[REDACTED]',
					token: '[REDACTED]',
					normalField: 'value',
				}),
			}),
		)
	})
})
