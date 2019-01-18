import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity, orderBy } from "./BaseEntity";
import { User } from "./User";

@Entity({ orderBy })
export class LoginToken extends BaseEntity {
  @Column({
    type: "varchar",
  })
  public token!: string;

  @ManyToOne(type => User)
  @JoinColumn()
  public user!: User;
}
