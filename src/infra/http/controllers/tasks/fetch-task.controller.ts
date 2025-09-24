import {
  BadRequestException,
  Controller,
  Get,
  Query,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ApiTags } from '@nestjs/swagger'
import { TaskPresenter } from '../../presenters/task-presenter'
import { FetchTasksUseCase } from '@/domain/todo/application/use-cases/task/get/get-tasks'

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@ApiTags('tasks')
@Controller('/tasks')
export class FetchTasksController {
  constructor(private fetchTasks: FetchTasksUseCase) { }

  @Get()
  async handle(
    @Query('page', queryValidationPipe) page: PageQueryParamSchema,
    @CurrentUser() user: UserPayload,
  ) {

    const userId = user.sub

    const result = await this.fetchTasks.execute({
      authorId: userId
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const comments = result.value.tasks

    return { comments: comments.map(TaskPresenter.toHTTP) }
  }
}
