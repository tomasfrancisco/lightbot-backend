import { BeforeInsert, Column, OrderByCondition, PrimaryGeneratedColumn } from "typeorm";
import { getCurrentDateSeconds } from "~/utils";

export const orderBy: OrderByCondition = {
  createdAt: "ASC",
  id: "ASC",
};

export abstract class BaseEntity {
  @PrimaryGeneratedColumn("increment") public id!: number;

  @Column()
  public createdAt!: number;

  @BeforeInsert()
  public addCreatedAt(): void {
    this.createdAt = getCurrentDateSeconds();
  }

  public toGraphType(): any {
    return {
      id: this.id,
      createdAt: this.createdAt,
    };
  }
}
