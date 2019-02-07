import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseEntity, orderBy } from "./BaseEntity";
import { Company } from "./Company";

@Entity({ orderBy })
export class User extends BaseEntity {
  @ManyToOne(type => Company, company => company.users)
  @JoinColumn()
  public company!: Company;

  @RelationId((user: User) => user.company)
  public companyId!: number;

  @Column({
    unique: true,
    length: 255,
  })
  public email!: string;

  @Column({
    unique: true,
    length: 255,
    nullable: true,
    type: "varchar",
  })
  public googleId?: string | null;

  @Column({ length: 255 })
  public password!: string;

  @Column({
    default: false,
  })
  public isAdmin!: boolean;

  @Column({ length: 255, nullable: true, type: "varchar" })
  public resetToken!: string | null;

  @Column({ default: false })
  public isActivated!: boolean;

  public toGraphType(): any {
    return {
      ...super.toGraphType(),
      company: this.company ? this.company.toGraphType() : undefined,
      companyId: this.companyId,
      isAdmin: this.isAdmin,
    };
  }
}
