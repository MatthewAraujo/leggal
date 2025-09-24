import { GenerateTaskUseCase } from './generate'

class OpenAiServiceMock {
  createCompletion = vi.fn()
}

describe('GenerateTaskUseCase', () => {
  let openAiService: OpenAiServiceMock
  let sut: GenerateTaskUseCase

  beforeEach(() => {
    openAiService = new OpenAiServiceMock()
    sut = new GenerateTaskUseCase(openAiService as any)
  })

  it('should return title and description parsed from OpenAI JSON', async () => {
    const payload = { title: 'Generated title', description: 'Generated description' }
      ; (openAiService.createCompletion as any).mockResolvedValueOnce(JSON.stringify(payload))

    const result = await sut.execute({ text: 'Some input text' })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({ title: payload.title, description: payload.description })
    expect(openAiService.createCompletion).toHaveBeenCalledTimes(1)
  })

  it('should throw if OpenAI returns null/empty response', async () => {
    ; (openAiService.createCompletion as any).mockResolvedValueOnce(null)

    await expect(() => sut.execute({ text: 'text' })).rejects.toThrowError('No response from openai')
  })
})


