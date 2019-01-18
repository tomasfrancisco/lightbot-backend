import { EntityRepository } from "typeorm";
import { Agent, User } from "~/database/entities";
import { BaseRepo } from "~/database/repositories/BaseRepo";

@EntityRepository(Agent)
export class AgentRepo extends BaseRepo<Agent> {
  private static readonly defaultRelations = ["data", "unknownTriggers"];

  public async findOneById<MaybeError extends Error | undefined>(
    id: number,
    errorIfNull: MaybeError,
  ): SmartPromise<Agent, MaybeError> {
    const result = await this.findOne(id, { relations: AgentRepo.defaultRelations });

    return this.resultOrThrow(result, errorIfNull);
  }

  public async findByUserAndId<MaybeError extends Error | undefined>(
    user: User,
    id: number,
    errorIfNull: MaybeError,
  ): SmartPromise<Agent, MaybeError> {
    const result = await this.findOne({
      where: {
        id,
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
