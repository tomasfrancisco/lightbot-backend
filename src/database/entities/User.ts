import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseEntity, orderBy } from "./BaseEntity";
import { Company } from "./Company";

@Entity({ orderBy })
export class User extends BaseEntity {
  @ManyToOne(type => Company, company => company.users)
  @JoinColumn()
  public company!: Company;

  @RelationId((user: User) => user.company) public companyId!: number;

  @Column({
    unique: true,
    length: 255,
  })
  public username!: string;

  @Column({ length: 255 })
  public password!: string;

  @Column({
    default: false,
  })
  public isAdmin!: boolean;

  public toGraphType(): any {
    return {
      ...super.toGraphType(),
      company: this.company ? this.company.toGraphType() : undefined,
      companyId: this.companyId,
      isAdmin: this.isAdmin,
    };
  }
}
