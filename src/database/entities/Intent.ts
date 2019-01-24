import { isNil } from "lodash";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OrderByCondition,
  RelationId,
} from "typeorm";
import { Agent } from "./Agent";
import { BaseEntity, orderBy } from "./BaseEntity";
import { IntentTrigger } from "./IntentTrigger";

@Entity({
  orderBy: {
    name: "ASC",
    ...orderBy,
  } as OrderByCondition,
})
export class Intent extends BaseEntity {
  @ManyToOne(type => Agent, agent => agent.intents, { nullable: false })
  @JoinColumn()
  public agent!: Agent;

  @RelationId((intent: Intent) => intent.agent)
  public agentId!: number;

  @Column()
  public name!: string;

  @Column({
    type: "simple-json",
  })
  public events: string[] = [];

  @Column({
    type: "varchar",
    nullable: true,
  })
  public action: string | undefined;

  @ManyToOne(type => Intent, intent => intent.children)
  public parent?: Intent | null;

  @RelationId((intent: Intent) => intent.parent)
  public parentId: number | null | undefined;

  @OneToMany(type => Intent, intent => intent.parent)
  public children!: Intent[];

  @Column()
  public isFallback: boolean = false;

  @OneToMany(type => IntentTrigger, trigger => trigger.intent)
  public triggers!: IntentTrigger[];

  @Column({
    type: "simple-json",
  })
  public outputs: object[] = [];

  public get isTopLevel(): boolean {
    return isNil(this.parentId);
  }

  public toGraphType(): any {
    return {
      ...super.toGraphType(),
      name: this.name,
      events: this.events,
      action: this.action,
      parentId: this.parentId,
      isTopLevel: isNil(this.parentId),
      isWelcome: this.events.includes("LIGHTBOT_WELCOME"),
      isFallback: this.isFallback,
      triggers: (this.triggers || []).map(it => it.toGraphType()),
      outputs: this.outputs,
    };
  }
}
