import { Either, left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Task, TaskPriority, TaskStatus } from '@/domain/todo/enterprise/entities/task'
import { AICacheService } from '@/infra/cache/ai-cache.service'
import { OpenAiService } from '@/infra/services/openai/openai.service'
import { Injectable } from '@nestjs/common'
import { TasksRepository } from '../../../repositories/task-repository'
import { InvalidOpenAiResponseError } from '../../errors/invalid-openai-response-error'
import { OpenAiNoResponseError } from '../../errors/openai-no-response-error'
import { TaskWithSameTitleError } from '../../errors/task-with-same-title-error'

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
    authorId,
  }: GenerateTaskUseCaseRequest): Promise<GenerateTaskUseCaseResponse> {

    const prompt = `Analise a seguinte mensagem do usuário e crie uma tarefa a partir dela.
    Retorne apenas um objeto JSON válido com os seguintes campos:
    - "title": Um título conciso para a tarefa
    - "description": Uma breve descrição da tarefa
    - "priority": Um dos valores LOW, MEDIUM ou HIGH (baseado na urgência/importância)

    Mensagem do usuário: "${text}"

    Exemplo de formato de resposta:
    {
      "title": "Corrigir bug de login",
      "description": "Usuários não conseguem entrar ao usar o SSO do Google",
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
      status: TaskStatus.PENDING,
    })

    await this.tasksRepository.create(task)

    const textForEmbedding = `${title}\n\n${description}`
    const embedding = await this.openaiService.createEmbedding(textForEmbedding)
    await this.tasksRepository.updateEmbedding(task.id.toString(), embedding)

    return right({
      task,
    })
  }
}
