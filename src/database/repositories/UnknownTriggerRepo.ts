import { EntityRepository } from "typeorm";
import { UnknownTrigger } from "~/database/entities";
import { BaseRepo } from "~/database/repositories/BaseRepo";

@EntityRepository(UnknownTrigger)
export class UnknownTriggerRepo extends BaseRepo<UnknownTrigger> {}
