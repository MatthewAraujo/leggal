import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { OpenAiService } from '@/infra/services/openai/openai.service'
import { Task, TaskPriority, TaskStatus } from '@/domain/todo/enterprise/entities/task'
import { TasksRepository } from '../../../repositories/task-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { AICacheService } from '@/infra/cache/ai-cache.service'
import { TaskWithSameTitleError } from '../../errors/task-with-same-title-error'
import { InvalidOpenAiResponseError } from '../../errors/invalid-openai-response-error'
import { OpenAiNoResponseError } from '../../errors/openai-no-response-error'

interface GenerateTaskUseCaseRequest {
  authorId: string
  text: string
}

type GenerateTaskUseCaseResponse = Either<
  TaskWithSameTitleError | OpenAiNoResponseError | InvalidOpenAiResponseError,
  {
    task: Task
  }
>

@Injectable()
export class GenerateTaskUseCase {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly openaiService: OpenAiService,
    private readonly aiCacheService: AICacheService,
  ) { }

  async execute({
    text,
    authorId
  }: GenerateTaskUseCaseRequest): Promise<GenerateTaskUseCaseResponse> {

    const prompt = `Analyze the following user message and create a task from it. 
      Return only a valid JSON object with the following fields:
      - "title": A concise title for the task
      - "description": A short description of the task
      - "priority": One of LOW, MEDIUM, or HIGH (based on urgency/importance)

      User message: "${text}"

      Example response format:
      {
        "title": "Fix login bug",
        "description": "Users are unable to log in when using Google SSO",
        "priority": "HIGH"
      }`

    let openAiResponse = await this.aiCacheService.getCachedResponse(prompt)

    if (!openAiResponse) {
      openAiResponse = await this.openaiService.createCompletion(prompt)

      if (openAiResponse) {
        await this.aiCacheService.setCachedResponse(prompt, openAiResponse, 3600)
      }
    }

    if (!openAiResponse) {
      throw new OpenAiNoResponseError()
    }

    let parsedResponse: any
    try {
      parsedResponse = JSON.parse(openAiResponse)
    } catch (err) {
      throw new InvalidOpenAiResponseError()
    }

    const title = parsedResponse.title
    const description = parsedResponse.description
    const priority = parsedResponse.priority as TaskPriority

    const taskWithSameTitle = await this.tasksRepository.findByTitle(title)
    if (taskWithSameTitle) {
      return left(new TaskWithSameTitleError(title))
    }

    const task = Task.create({
      authorId: new UniqueEntityID(authorId),
      title,
      description,
      priority,
      status: TaskStatus.PENDING
    })

    await this.tasksRepository.create(task)


    const textForEmbedding = `${title}\n\n${description}`
    const embedding = await this.openaiService.createEmbedding(textForEmbedding)
    await this.tasksRepository.updateEmbedding(task.id.toString(), embedding)

    return right({
      task
    })
  }
}
