import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity, orderBy } from "./BaseEntity";
import { Dictionary } from "./Dictionary";

export type DictionaryItem = string;

@Entity({ orderBy })
export class DictionaryValue extends BaseEntity {
  @ManyToOne(type => Dictionary, dictionary => dictionary.values)
  @JoinColumn()
  public dictionary!: Dictionary;

  @Column({
    type: "varchar",
  })
  public value: DictionaryItem = "";

  public toGraphType(): any {
    return {
      ...super.toGraphType(),
      value: this.value,
      dictionaryId: this.dictionary ? this.dictionary.id : undefined,
    };
  }
}
