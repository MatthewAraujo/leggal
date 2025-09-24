import {
  Body,
  Controller,
  HttpCode,
  Post,
  BadRequestException,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger'
import { z } from 'zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { Task } from '@/domain/todo/enterprise/entities/task'
import { TaskPresenter } from '@/infra/http/presenters/task-presenter'
import { SemanticSearchDto } from '../../dtos/task/semantic-search.dto'
import { SemanticSearchEmbeddingUseCase } from '@/domain/todo/application/use-cases/task/ia/semantic-search'

const semanticSearchBodySchema = z.object({
  title: z.string(),
  description: z.string(),
})

type SemanticSearchBody = z.infer<typeof semanticSearchBodySchema>

@ApiTags('tasks')
@ApiBearerAuth('JWT-auth')
@Controller('/tasks/semantic-search')
export class SemanticSearchController {
  constructor(private semanticSearchUseCase: SemanticSearchEmbeddingUseCase) { }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Buscar tarefas semanticamente similares' })
  @ApiBody({ type: SemanticSearchDto })
  @ApiResponse({ status: 200, description: 'Retorna as tarefas similares' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async handle(
    @Body(new ZodValidationPipe(semanticSearchBodySchema)) body: SemanticSearchBody
  ) {
    const { title, description } = body

    const result = await this.semanticSearchUseCase.execute({ title, description })

    if (result.isLeft()) {
      throw new BadRequestException('Erro ao buscar tasks similares')
    }

    const tasks: Task[] = result.value.tasks

    return { tasks: tasks.map(TaskPresenter.toHTTP) }
  }
}

