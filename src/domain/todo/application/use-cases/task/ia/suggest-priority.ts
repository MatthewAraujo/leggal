import { Either, left, right } from '@/core/either'
import { TaskPriority } from '@/domain/todo/enterprise/entities/task'
import { AICacheService } from '@/infra/cache/ai-cache.service'
import { OpenAiService } from '@/infra/services/openai/openai.service'
import { Injectable } from '@nestjs/common'
import { InvalidOpenAiResponseError } from '../../errors/invalid-openai-response-error'
import { OpenAiNoResponseError } from '../../errors/openai-no-response-error'

interface SuggestPriorityUseCaseRequest {
  title: string
  description: string
}

type SuggestPriorityUseCaseResponse = Either<
  OpenAiNoResponseError | InvalidOpenAiResponseError,
  { priority: TaskPriority; reason: string }
>

@Injectable()
export class SuggestPriorityUseCase {
  constructor(
    private readonly openaiService: OpenAiService,
    private readonly aiCacheService: AICacheService,
  ) { }

  async execute({
    title,
    description,
  }: SuggestPriorityUseCaseRequest): Promise<SuggestPriorityUseCaseResponse> {

    const prompt = `
    Analise a seguinte tarefa e sugira uma prioridade apropriada: BAIXA, MÉDIA ou ALTA.
    Retorne apenas um objeto JSON com o campo "priority" e "reason".

    Título da tarefa: "${title}"
    Descrição da tarefa: "${description}"

    Tipos de prioridade:
    ['LOW','MEDIUM','HIGH']

    Exemplo de formato de resposta:
    {
      "priority": "HIGH",
      "reason": "Esta tarefa tem prioridade ALTA porque possui um prazo crítico e impacta diretamente a entrega do projeto."
    }
`


    let openAiResponse = await this.aiCacheService.getCachedResponse(prompt)

    if (!openAiResponse) {
      openAiResponse = await this.openaiService.createCompletion(prompt)

      if (openAiResponse) {
        await this.aiCacheService.setCachedResponse(prompt, openAiResponse, 7200)
      }
    }

    if (!openAiResponse) {
      return left(new OpenAiNoResponseError())
    }

    let parsed: any
    try {
      parsed = JSON.parse(openAiResponse)
    } catch (err) {
      return left(new InvalidOpenAiResponseError())
    }

    const priority = parsed.priority as TaskPriority
    const reason = parsed.reason

    return right({ priority, reason })
  }
}
