
import { AggregateRoot } from '@/core/entities/aggregate-root'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import dayjs from 'dayjs'
import { Slug } from './value-objects/slug'

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface TaskProps {
  authorId: UniqueEntityID
  title: string
  description: string
  slug: Slug
  priority: TaskPriority
  status: TaskStatus
  createdAt: Date
  updatedAt?: Date | null
}

export class Task extends AggregateRoot<TaskProps> {
  get authorId() {
    return this.props.authorId
  }

  get title() {
    return this.props.title
  }

  set title(title: string) {
    this.props.title = title
    this.props.slug = Slug.createFromText(title)
    this.touch()
  }

  get description() {
    return this.props.description
  }

  set description(description: string) {
    this.props.description = description
    this.touch()
  }

  get slug() {
    return this.props.slug
  }

  get priority() {
    return this.props.priority
  }

  set priority(priority: TaskPriority) {
    this.props.priority = priority
    this.touch()
  }

  get status() {
    return this.props.status
  }

  set status(status: TaskStatus) {
    this.props.status = status
    this.touch()
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get isNew(): boolean {
    return dayjs().diff(this.createdAt, 'days') <= 3
  }

  get excerpt() {
    return this.description.substring(0, 120).trimEnd().concat('...')
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<TaskProps, 'createdAt' | 'slug' | 'status' | 'priority'>,
    id?: UniqueEntityID,
  ) {
    const task = new Task(
      {
        ...props,
        slug: props.slug ?? Slug.createFromText(props.title),
        createdAt: props.createdAt ?? new Date(),
        status: props.status ?? TaskStatus.PENDING,
        priority: props.priority ?? TaskPriority.MEDIUM,
      },
      id,
    )

    return task
  }
}

