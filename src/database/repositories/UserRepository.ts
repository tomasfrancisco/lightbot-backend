import { EntityRepository } from "typeorm";
import { Company, User } from "~/database/entities";
import { BaseRepo } from "~/database/repositories/BaseRepo";
import { getCompanyRepo } from "~/database/repositories/index";

@EntityRepository(User)
export class UserRepository extends BaseRepo<User> {
  private static readonly defaultRelations = ["company"];

  public async findById(id: number): Promise<User | undefined> {
    return this.findOne(id, {
      relations: UserRepository.defaultRelations,
    });
  }

  public async getByEmail(email: string): Promise<User | undefined> {
    return this.findOne({
      where: {
        email,
      },
      relations: UserRepository.defaultRelations,
    });
  }

  public async getByToken(resetToken: string): Promise<User | undefined> {
    return this.findOne({
      relations: UserRepository.defaultRelations,
      where: {
        resetToken,
      },
    });
  }

  public async getByGoogleId(googleId: string): Promise<User | void> {
    return this.findOne({
      where: {
        googleId,
      },
      relations: UserRepository.defaultRelations,
    });
  }

  /**
   * Create a user based on google profile. Uses static email and password if not known.
   */
  public async createByGoogleAndCompany(profile: any, company: Company): Promise<User> {
    const emails = (profile.emails || []).filter((it: any) => it.verified);

    const email = emails.length > 0 ? emails[0].value : "unknown";

    const user = await this.save(
      this.create({
        email,
        password: "googleAccount",
        googleId: profile.id,
        isActivated: true,
        company,
      }),
      { reload: true },
    );
    company.admin = user;
    await getCompanyRepo().save(company);

    return user;
  }
}
