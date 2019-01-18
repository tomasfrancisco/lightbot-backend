import { agentMutations } from "~/graph/mutation/agent";
import { dictionaryMutations } from "~/graph/mutation/dictionary";
import { intentMutations } from "~/graph/mutation/intent";

export const mutations = {
  Mutation: {
    ...agentMutations,
    ...dictionaryMutations,
    ...intentMutations,
  },
};
