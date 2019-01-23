import { ConnectionOptions } from "typeorm";
import {
  Agent,
  AgentData,
  Company,
  Dictionary,
  DictionaryValue,
  Intent,
  IntentTrigger,
  LoginToken,
  UnknownTrigger,
  User,
} from "~/database/entities";
import { DBNamingStrategy } from "./DBNamingStrategy";

export const config: ConnectionOptions = {
  name: "default",
  namingStrategy: new DBNamingStrategy(),
  debug: process.env.NODE_ENV === "development" ? ["ComQueryPacket"] : [],
  type: "mysql",
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  synchronize: false,
  logging: ["error"],
  entities: [
    Agent,
    AgentData,
    Company,
    Dictionary,
    DictionaryValue,
    Intent,
    IntentTrigger,
    LoginToken,
    UnknownTrigger,
    User,
  ],
  cli: {
    entitiesDir: "src/database/entities",
    migrationsDir: "src/database/migrations",
    subscribersDir: "src/database/subscribers",
  },
  extra: {
    connectionLimit: 50,
    multipleStatements: true,
  },
};
