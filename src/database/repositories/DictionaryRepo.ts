import { EntityRepository } from "typeorm";
import { Agent, Dictionary, User } from "~/database/entities";
import { BaseRepo } from "~/database/repositories/BaseRepo";

@EntityRepository(Dictionary)
export class DictionaryRepo extends BaseRepo<Dictionary> {
  private static readonly defaultRelations = ["values"];

  public async findWithValues(companyId: number): Promise<Dictionary[]> {
    return this.find({
      where: { company: companyId },
      relations: DictionaryRepo.defaultRelations,
    });
  }

  public async findByIdAndUser<MaybeError extends Error | undefined>(
    id: number,
    user: User,
    errorIfNull: MaybeError,
  ): SmartPromise<Dictionary, MaybeError> {
    const result = await this.findOne(id, {
      where: {
        company: user.companyId,
      },
      relations: DictionaryRepo.defaultRelations,
    });

    return this.resultOrThrow(result, errorIfNull);
  }

  public async findByNameAndUser<MaybeError extends Error | undefined>(
    name: string,
    user: User,
    errorIfNull: MaybeError,
  ): SmartPromise<Dictionary, MaybeError> {
    const result = await this.findOne({
      where: {
        company: user.companyId,
        name,
      },
      relations: DictionaryRepo.defaultRelations,
    });

    return this.resultOrThrow(result, errorIfNull);
  }

  public async createByName(name: string, companyId: number): Promise<Dictionary> {
    const intermediate = this.create({
      company: {
        id: companyId,
      },
      name,
    });

    const result = await this.save(intermediate);

    return (await this.findOne(result.id, {
      relations: DictionaryRepo.defaultRelations,
    }))!;
  }

  public async findByAgent(agent: Agent): Promise<Dictionary[]> {
    return this.find({
      relations: DictionaryRepo.defaultRelations,
      where: {
        company: {
          id: agent.companyId,
        },
      },
    });
  }
}
