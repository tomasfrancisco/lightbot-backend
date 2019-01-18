import { agentQueries } from "~/graph/query/agent";
import { intentQueries } from "~/graph/query/intent";
import { rootQueries } from "~/graph/query/query";

export const queries = {
  Query: rootQueries,
  Intent: intentQueries,
  Agent: agentQueries,
};
