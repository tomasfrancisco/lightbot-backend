import { EntityRepository, Repository } from "typeorm";
import { Company, DictionaryValue, IntentTrigger } from "~/database/entities";
import { BaseEntity } from "~/database/entities/BaseEntity";

export class BaseRepo<T extends BaseEntity> extends Repository<T> {
  /**
   * Helper to throw the error if provided and the result from the database is undefined.
   * Else return T | undefined if error is not provided or T when the result is there and
   * an error is provided.
   */
  protected async resultOrThrow<S extends Error | undefined>(
    value: T | undefined,
    errorIfNull: S,
  ): SmartPromise<T, S> {
    if (value === undefined && errorIfNull !== undefined) {
      throw errorIfNull;
    } else if (value !== undefined) {
      return value as any;
    } else {
      return value as any;
    }
  }
}

@EntityRepository(DictionaryValue)
export class DictionaryValueRepo extends BaseRepo<DictionaryValue> {}

@EntityRepository(IntentTrigger)
export class IntentTriggerRepo extends BaseRepo<IntentTrigger> {}

@EntityRepository(Company)
export class CompanyRepo extends BaseRepo<Company> {
  public async getNewCompany(): Promise<Company> {
    return this.save(
      this.create({
        name: "private",
      }),
      { reload: true },
    );
  }
}
