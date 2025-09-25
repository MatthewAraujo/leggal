import { SemanticSearchEmbeddingUseCase } from '@/domain/todo/application/use-cases/task/ia/semantic-search'
import { Task } from '@/domain/todo/enterprise/entities/task'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { TaskPresenter } from '@/infra/http/presenters/task-presenter'
import { BadRequestException, Body, Controller, HttpCode, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { SemanticSearchDto } from '../../dtos/task/semantic-search.dto'

const semanticSearchBodySchema = z.object({
	title: z.string(),
	description: z.string(),
})

type SemanticSearchBody = z.infer<typeof semanticSearchBodySchema>

@ApiTags('tasks')
@ApiBearerAuth('JWT-auth')
@Controller('/tasks/semantic-search')
export class SemanticSearchController {
	constructor(private semanticSearchUseCase: SemanticSearchEmbeddingUseCase) {}

	@Post()
	@HttpCode(200)
	@ApiOperation({ summary: 'Buscar tarefas semanticamente similares' })
	@ApiBody({ type: SemanticSearchDto })
	@ApiResponse({ status: 200, description: 'Retorna as tarefas similares' })
	@ApiResponse({ status: 400, description: 'Dados inválidos' })
	async handle(@Body(new ZodValidationPipe(semanticSearchBodySchema)) body: SemanticSearchBody) {
		const { title, description } = body

		const result = await this.semanticSearchUseCase.execute({ title, description })

		if (result.isLeft()) {
			throw new BadRequestException('Erro ao buscar tasks similares')
		}

		const tasks: Task[] = result.value.tasks

		return { tasks: tasks.map(TaskPresenter.toHTTP) }
	}
}
