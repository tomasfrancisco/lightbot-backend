import { isNil } from "lodash";
import { EntityRepository, MoreThan } from "typeorm";
import { LoginToken, User } from "~/database/entities";
import { BaseRepo } from "~/database/repositories/BaseRepo";
import { logger } from "~/logger";
import { getCurrentDateSeconds } from "~/utils";

@EntityRepository(LoginToken)
export class LoginTokenRepo extends BaseRepo<LoginToken> {
  public async findUserOrNull(token: string): Promise<User | null> {
    const createdAfter = getCurrentDateSeconds() - 24 * 60 * 60; // 24 hour use
    logger.log("Created after", createdAfter);
    const loginToken = await this.findOne(
      {
        token,
        createdAt: MoreThan(createdAfter),
      },
      { relations: ["user"] },
    );

    if (isNil(loginToken)) {
      return null;
    }

    return loginToken.user;
  }
}
