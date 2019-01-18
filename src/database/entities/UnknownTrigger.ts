import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Agent } from "./Agent";
import { BaseEntity, orderBy } from "./BaseEntity";

@Entity({ orderBy })
export class UnknownTrigger extends BaseEntity {
  @ManyToOne(() => Agent, agent => agent.unknownTriggers)
  @JoinColumn()
  public agent!: Agent;

  @Column()
  public value!: string;

  public toGraphType(): any {
    return {
      ...super.toGraphType(),
      value: this.value,
    };
  }
}
