import { Column, Entity, OneToMany } from "typeorm";
import { Agent } from "./Agent";
import { BaseEntity, orderBy } from "./BaseEntity";
import { Dictionary } from "./Dictionary";
import { User } from "./User";

@Entity({ orderBy })
export class Company extends BaseEntity {
  @Column()
  public name!: string;

  @OneToMany(type => Dictionary, dictionary => dictionary.company)
  public dictionaries!: Dictionary[];

  @OneToMany(type => User, user => user.company)
  public users!: User[];

  @OneToMany(type => Agent, agent => agent.company)
  public agents!: Agent[];
}
