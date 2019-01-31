import { isNil } from "lodash";
import { EntityRepository } from "typeorm";
import { Agent, User } from "~/database/entities";
import { BaseRepo } from "~/database/repositories/BaseRepo";

export interface CompositeAgentId {
  id?: number;
  uuid?: string;
}

@EntityRepository(Agent)
export class AgentRepo extends BaseRepo<Agent> {
  private static readonly defaultRelations = ["data", "unknownTriggers"];

  public async findOneById<MaybeError extends Error | undefined>(
    id: CompositeAgentId,
    errorIfNull: MaybeError,
  ): SmartPromise<Agent, MaybeError> {
    const result = !isNil(id.id)
      ? await this.findOne(id.id, { relations: AgentRepo.defaultRelations })
      : await this.findOne({ uuid: id.uuid }, { relations: AgentRepo.defaultRelations });

    return this.resultOrThrow(result, errorIfNull);
  }

  public async findByUserAndId<MaybeError extends Error | undefined>(
    user: User,
    id: CompositeAgentId,
    errorIfNull: MaybeError,
  ): SmartPromise<Agent, MaybeError> {
    const result = await this.findOne({
      where: {
        ...id,
        company: {
          id: user.companyId,
        },
      },
      relations: AgentRepo.defaultRelations,
    });

    return this.resultOrThrow(result, errorIfNull);
  }

  public async findForUser(user: User): Promise<Agent[]> {
    return this.find({
      where: {
        company: {
          id: user.companyId,
        },
      },
      relations: AgentRepo.defaultRelations,
    });
  }
}
