import { UseCaseError } from '@/core/errors/use-case-error'

export class InvalidOpenAiResponseError extends Error implements UseCaseError {
  constructor() {
    super('Invalid JSON returned from OpenAI')
  }
}
