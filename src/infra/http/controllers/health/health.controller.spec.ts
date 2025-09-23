import { Test, TestingModule } from '@nestjs/testing'
import { HealthController } from './health.controller'

describe('HealthController', () => {
  let controller: HealthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile()

    controller = module.get<HealthController>(HealthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should return health status', () => {
    const result = controller.check()

    expect(result).toHaveProperty('status', 'ok')
    expect(result).toHaveProperty('timestamp')
    expect(result).toHaveProperty('uptime')
    expect(result).toHaveProperty('environment')
    expect(typeof result.uptime).toBe('number')
    expect(typeof result.timestamp).toBe('string')
    expect(typeof result.environment).toBe('string')
  })

  it('should return valid timestamp format', () => {
    const result = controller.check()
    const timestamp = new Date(result.timestamp)

    expect(timestamp).toBeInstanceOf(Date)
    expect(timestamp.getTime()).not.toBeNaN()
  })
})
