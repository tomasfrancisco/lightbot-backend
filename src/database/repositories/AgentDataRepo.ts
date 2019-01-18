import { EntityRepository } from "typeorm";
import { Agent, AgentData } from "~/database/entities";
import { BaseRepo } from "~/database/repositories/BaseRepo";

@EntityRepository(AgentData)
export class AgentDataRepo extends BaseRepo<AgentData> {
  public async findForAgent(agent: Agent | number): Promise<AgentData[]> {
    if (typeof agent === "number") {
      return this.find({
        agent: {
          id: agent,
        },
      });
    } else {
      return this.find({ agent });
    }
  }
}
