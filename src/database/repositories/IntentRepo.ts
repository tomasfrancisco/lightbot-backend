import { isNil } from "lodash";
import { Brackets, EntityRepository, In, Like } from "typeorm";
import { Agent, Intent, User } from "~/database/entities";
import { BaseRepo } from "~/database/repositories/BaseRepo";
import { IntentExpression, SearchIntent } from "~/types";
import { LogMethodTime } from "~/utils";

@EntityRepository(Intent)
export class IntentRepo extends BaseRepo<Intent> {
  private static readonly defaultRelations = ["triggers"];

  public async findByUser(user: User): Promise<Intent[]> {
    return this.find({
      where: {
        agent: {
          company: {
            id: user.companyId,
          },
        },
      },
      relations: IntentRepo.defaultRelations,
    });
  }

  public async search(user: User, searchData: SearchIntent): Promise<Intent[]> {
    const qb = this.createQueryBuilder("intent")
      .leftJoinAndSelect("intent.triggers", "trigger")
      .leftJoin("intent.agent", "agent")
      .leftJoin("agent.company", "company")
      .where("company.id = :companyId", { companyId: user.companyId });

    if (!isNil(searchData.agentId)) {
      qb.andWhere("agent.uuid = :agentId", { agentId: searchData.agentId });
    }
    if (!isNil(searchData.id)) {
      qb.andWhere("intent.id = :id", { id: searchData.id });
    }
    if (!isNil(searchData.isTopLevel)) {
      if (!!searchData.isTopLevel) {
        qb.andWhere("intent.parent IS NULL");
      } else {
        qb.andWhere("intent.parent IS NOT NULL");
      }
    }

    return qb.getMany();
  }

  public async searchExpression(user: User, search: IntentExpression): Promise<Intent[]> {
    const qb = this.createQueryBuilder("intent")
      .leftJoin("intent.agent", "agent")
      .leftJoinAndSelect("intent.triggers", "trigger")
      .where("agent.company = :companyId", { companyId: user.companyId });

    if (!isNil(search.agentId)) {
      qb.andWhere("agent.uuid = :agentId", { agentId: search.agentId });
    }
    if (!isNil(search.isTopLevel)) {
      if (!!search.isTopLevel) {
        qb.andWhere("intent.parent IS NULL");
      } else {
        qb.andWhere("intent.parent IS NOT NULL");
      }
    }
    if (!isNil(search.intentExpression)) {
      qb.andWhere(
        new Brackets(qb1 => {
          qb1
            .where("intent.name LIKE :expression", {
              expression: search.intentExpression,
            })
            .orWhere("trigger.value LIKE :expression", {
              expression: search.intentExpression,
            });
        }),
      );
    }

    return qb.getMany();
  }

  public async findChildren(intentId: number): Promise<Intent[]> {
    return this.find({
      where: {
        parent: {
          id: intentId,
        },
      },
      relations: IntentRepo.defaultRelations,
    });
  }

  public async findByIdAndAgent<MaybeError extends Error | undefined>(
    parentId: number,
    agent: Agent,
    errorIfNull: MaybeError,
  ): SmartPromise<Intent, MaybeError> {
    const result = await this.findOne(
      {
        id: parentId,
        agent,
      },
      { relations: IntentRepo.defaultRelations },
    );

    return this.resultOrThrow(result, errorIfNull);
  }

  public async findIds(agent: Agent, ids: number[]): Promise<Intent[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.find({
      select: ["id"],
      where: {
        id: In(ids),
      },
    });
  }

  public async findOneById<MaybeError extends Error | undefined>(
    id: number,
    errorIfNull: MaybeError,
  ): SmartPromise<Intent, MaybeError> {
    const result = await this.findOne(id, {
      relations: IntentRepo.defaultRelations,
    });

    return this.resultOrThrow(result, errorIfNull);
  }

  @LogMethodTime("IntentRepo#FindOneByUserAndId")
  public async findOneByUserAndId<MaybeError extends Error | undefined>(
    user: User,
    id: number,
    errorIfNull: MaybeError,
  ): SmartPromise<Intent, MaybeError> {
    const result = await this.createQueryBuilder("intent")
      .leftJoinAndSelect("intent.triggers", "trigger")
      .innerJoin("intent.agent", "agent")
      .innerJoin("agent.company", "company", "company.id = :companyId", {
        companyId: user.companyId,
      })
      .where("intent.id = :intentId", { intentId: id })
      .getOne();

    return this.resultOrThrow(result, errorIfNull);
  }

  public async findByAgent(agent: Agent): Promise<Intent[]> {
    return this.find({
      relations: IntentRepo.defaultRelations,
      where: {
        agent,
      },
    });
  }

  public async findWithEvent(agent: Agent, eventName: string): Promise<Intent[]> {
    return this.find({
      where: {
        agent,
        events: Like(`%${eventName}%`),
      },
      relations: IntentRepo.defaultRelations,
    });
  }
}
