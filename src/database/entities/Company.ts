import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  RelationId,
} from "typeorm";
import * as uuid from "uuid";
import { Agent } from "./Agent";
import { BaseEntity, orderBy } from "./BaseEntity";
import { Dictionary } from "./Dictionary";
import { User } from "./User";

@Entity({ orderBy })
export class Company extends BaseEntity {
  @Column()
  public name!: string;

  @Column()
  public uniqueToken!: string;

  @OneToOne(type => User)
  @JoinColumn()
  public admin!: User;

  @RelationId((company: Company) => company.admin)
  public adminId!: number;

  @OneToMany(type => Dictionary, dictionary => dictionary.company)
  public dictionaries!: Dictionary[];

  @OneToMany(type => User, user => user.company)
  public users!: User[];

  @OneToMany(type => Agent, agent => agent.company)
  public agents!: Agent[];

  @BeforeInsert()
  public regenerateToken(): void {
    this.uniqueToken = uuid();
  }
}
