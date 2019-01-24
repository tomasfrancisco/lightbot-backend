import {
  Column,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  RelationId,
} from "typeorm";
import { AgentData } from "./AgentData";
import { BaseEntity, orderBy } from "./BaseEntity";
import { Company } from "./Company";
import { Intent } from "./Intent";
import { UnknownTrigger } from "./UnknownTrigger";

@Entity({ orderBy })
@Index("idx_name_company", ["company", "name"], { unique: true })
export class Agent extends BaseEntity {
  @Column({
    length: 36,
    type: "varchar",
    unique: true,
  })
  @Generated("uuid")
  public uuid!: string;

  @ManyToOne(() => Company, company => company.agents)
  @JoinColumn()
  public company!: Company;

  @RelationId((agent: Agent) => agent.company)
  public companyId!: number;

  @Column({
    length: 255,
    nullable: false,
  })
  public name!: string;

  @OneToMany(() => Intent, intent => intent.agent)
  public intents!: Intent[];

  @OneToMany(() => AgentData, data => data.agent)
  public data!: AgentData[];

  @OneToMany(() => UnknownTrigger, unknownTrigger => unknownTrigger.agent)
  public unknownTriggers!: UnknownTrigger[];

  public toGraphType(): any {
    return {
      ...super.toGraphType(),
      id: this.uuid,
      name: this.name,
      data: AgentData.toObject(this.uuid, this.data),
      unknownTriggers: this.unknownTriggers.map(it => it.toGraphType()),
      unknownTriggersCount: this.unknownTriggers.length,
    };
  }
}
