import { Either, right } from '@/core/either'
import { Task } from '@/domain/todo/enterprise/entities/task'
import { AICacheService } from '@/infra/cache/ai-cache.service'
import { OpenAiService } from '@/infra/services/openai/openai.service'
import { Injectable } from '@nestjs/common'
import { TasksRepository } from '../../../repositories/task-repository'

interface SemanticSearchTaskUseCaseRequest {
  description: string
}

type SemanticSearchTaskUseCaseResponse = Either<null, { tasks: Task[] }>

@Injectable()
export class SemanticSearchEmbeddingUseCase {
  constructor(
    private tasksRepository: TasksRepository,
    private openaiService: OpenAiService,
    private aiCacheService: AICacheService,
  ) { }

  async execute({
    description,
  }: SemanticSearchTaskUseCaseRequest): Promise<SemanticSearchTaskUseCaseResponse> {

    const cacheKey = `embedding:${description}`
    const cachedEmbedding = await this.aiCacheService.getCachedResponse(cacheKey)

    let embedding: number[]

    if (cachedEmbedding) {
      try {
        embedding = JSON.parse(cachedEmbedding)
      } catch (error) {
        embedding = await this.openaiService.createEmbedding(description)
        await this.aiCacheService.setCachedResponse(cacheKey, JSON.stringify(embedding), 7200)
      }
    } else {
      embedding = await this.openaiService.createEmbedding(description)
      await this.aiCacheService.setCachedResponse(cacheKey, JSON.stringify(embedding), 7200)
    }

    const task = await this.tasksRepository.findSimilarTasks(embedding)

    return right({ tasks: task })
  }
}
