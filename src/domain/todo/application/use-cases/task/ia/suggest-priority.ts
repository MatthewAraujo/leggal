import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { TaskPriority } from '@/domain/todo/enterprise/entities/task'
import { OpenAiService } from '@/infra/services/openai/openai.service'

interface SuggestPriorityUseCaseRequest {
  title: string
  description: string
}

type SuggestPriorityUseCaseResponse = Either<null, { priority: TaskPriority, reason: string }>

@Injectable()
export class SuggestPriorityUseCase {
  constructor(private readonly openaiService: OpenAiService) { }

  async execute({
    title,
    description,
  }: SuggestPriorityUseCaseRequest): Promise<SuggestPriorityUseCaseResponse> {
    const prompt = `
      Analyze the following task and suggest an appropriate priority: LOW, MEDIUM, or HIGH.
      Return only a JSON object with the "priority" field.

      Task title: "${title}"
      Task description: "${description}"

      Example response format:
      {
        "priority": "HIGH"
        "reason": "This task is HIGH priority because it has a critical deadline and directly impacts project delivery."
      }
    `

    const openAiResponse = await this.openaiService.createCompletion(prompt)

    if (!openAiResponse) {
      throw new Error('No response from OpenAI')
    }

    const parsed = JSON.parse(openAiResponse)
    const priority = parsed.priority as TaskPriority
    const reason = parsed.reason

    return right({ priority, reason })
  }
}

