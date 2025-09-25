import { TaskPriority } from '@/domain/todo/enterprise/entities/task'
import { SuggestPriorityUseCase } from './suggest-priority'

class OpenAiServiceMock {
  createCompletion = vi.fn()
}

describe('SuggestPriorityUseCase', () => {
  let openAiService: OpenAiServiceMock
  let sut: SuggestPriorityUseCase

  beforeEach(() => {
    openAiService = new OpenAiServiceMock()
    sut = new SuggestPriorityUseCase(openAiService as any)
  })

  it('should return priority and reason parsed from OpenAI JSON', async () => {
    const payload = { priority: TaskPriority.HIGH, reason: 'Because it is urgent' }
      ; (openAiService.createCompletion as any).mockResolvedValueOnce(JSON.stringify(payload))

    const result = await sut.execute({ title: 'Foo', description: 'Bar' })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual(payload)
    expect(openAiService.createCompletion).toHaveBeenCalledTimes(1)
  })

  it('should throw if OpenAI returns null', async () => {
    ; (openAiService.createCompletion as any).mockResolvedValueOnce(null)

    await expect(() => sut.execute({ title: 'a', description: 'b' })).rejects.toThrowError(
      'No response from OpenAI',
    )
  })
})
