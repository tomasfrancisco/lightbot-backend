import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OrderByCondition,
} from "typeorm";

import { BaseEntity, orderBy } from "./BaseEntity";
import { Company } from "./Company";
import { DictionaryValue } from "./DictionaryValue";

@Entity({
  orderBy: {
    name: "ASC",
    ...orderBy,
  } as OrderByCondition,
})
export class Dictionary extends BaseEntity {
  @ManyToOne(type => Company, company => company.dictionaries)
  @JoinColumn()
  public company!: Company;

  @Column({ nullable: false })
  public name!: string;

  @OneToMany(type => DictionaryValue, value => value.dictionary)
  public values!: DictionaryValue[];

  public toGraphType(): any {
    return {
      ...super.toGraphType(),
      name: this.name,
      values: (this.values || []).map(it => it.toGraphType()),
    };
  }
}
