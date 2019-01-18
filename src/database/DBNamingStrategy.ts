import { snakeCase } from "lodash";
import { DefaultNamingStrategy, NamingStrategyInterface, Table } from "typeorm";

export class DBNamingStrategy extends DefaultNamingStrategy
  implements NamingStrategyInterface {
  public tableName(targetName: string, userSpecifiedName: string | undefined): string {
    return userSpecifiedName ? userSpecifiedName : snakeCase(targetName);
  }

  public columnName(
    propertyName: string,
    customName: string,
    embeddedPrefixes: string[],
  ): string {
    return snakeCase(propertyName);
  }

  public relationName(propertyName: string): string {
    return snakeCase(propertyName);
  }

  public primaryKeyName(tableOrName: Table | string, columnNames: string[]): string {
    const tableName = tableOrName instanceof Table ? tableOrName.name : tableOrName;

    return snakeCase(`${tableName}_id`);
  }

  public uniqueConstraintName(
    tableOrName: Table | string,
    columnNames: string[],
  ): string {
    const tableName = tableOrName instanceof Table ? tableOrName.name : tableOrName;

    return snakeCase(`UNIQUE_${tableName}_${columnNames.join("_")}`);
  }

  public foreignKeyName(tableOrName: Table | string, columnNames: string[]): string {
    const tableName = tableOrName instanceof Table ? tableOrName.name : tableOrName;

    return snakeCase(`fk_${tableName}_${columnNames.join("_")}`);
  }

  public indexName(
    tableOrName: Table | string,
    columnNames: string[],
    where?: string,
  ): string {
    const tableName = tableOrName instanceof Table ? tableOrName.name : tableOrName;

    return snakeCase(`idx_${tableName}_${columnNames.join("_")}`);
  }

  public joinTableName(
    firstTableName: string,
    secondTableName: string,
    firstPropertyName: string,
    secondPropertyName: string,
  ): string {
    return snakeCase(`${firstTableName}_${secondTableName}`);
  }
}
