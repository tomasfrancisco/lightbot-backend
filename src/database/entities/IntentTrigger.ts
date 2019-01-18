import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { IntentTriggerType } from "~/types";

import { BaseEntity, orderBy } from "./BaseEntity";
import { Intent } from "./Intent";

@Entity({ orderBy })
export class IntentTrigger extends BaseEntity {
  @ManyToOne(type => Intent, intent => intent.triggers)
  @JoinColumn()
  public intent!: Intent;

  @Column({
    type: "enum",
    enum: IntentTriggerType,
  })
  public type: IntentTriggerType = IntentTriggerType.Plain;

  @Column({
    type: "simple-json",
    nullable: false,
  })
  public value!: string[];

  public toGraphType(): any {
    return {
      ...super.toGraphType(),
      type: this.type,
      value: this.value,
    };
  }
}
