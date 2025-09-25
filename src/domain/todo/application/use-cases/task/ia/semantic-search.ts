import { Injectable } from '@nestjs/common'
import { OpenAiService } from '@/infra/services/openai/openai.service'
import { Task, } from '@/domain/todo/enterprise/entities/task'
import { Either, right } from '@/core/either'
import { TasksRepository } from '../../../repositories/task-repository'
import { AICacheService } from '@/infra/cache/ai-cache.service'

interface SemanticSearchTaskUseCaseRequest {
  title: string
  description: string
}

type SemanticSearchTaskUseCaseResponse = Either<
  null,
  { tasks: Task[] }
>


@Injectable()
export class SemanticSearchEmbeddingUseCase {
  constructor(
    private tasksRepository: TasksRepository,
    private openaiService: OpenAiService,
    private aiCacheService: AICacheService,
  ) { }

  async execute({ title, description }: SemanticSearchTaskUseCaseRequest): Promise<SemanticSearchTaskUseCaseResponse> {
    const searchText = `${title} ${description}`

    const cacheKey = `embedding:${searchText}`
    const cachedEmbedding = await this.aiCacheService.getCachedResponse(cacheKey)

    let embedding: number[]

    if (cachedEmbedding) {
      try {
        embedding = JSON.parse(cachedEmbedding)
      } catch (error) {
        embedding = await this.openaiService.createEmbedding(searchText)
        await this.aiCacheService.setCachedResponse(cacheKey, JSON.stringify(embedding), 7200)
      }
    } else {
      embedding = await this.openaiService.createEmbedding(searchText)
      await this.aiCacheService.setCachedResponse(cacheKey, JSON.stringify(embedding), 7200)
    }

    const task = await this.tasksRepository.findSimilarTasks(embedding)

    return right({ tasks: task })
  }
}

