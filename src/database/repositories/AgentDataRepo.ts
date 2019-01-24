import { EntityRepository } from "typeorm";
import { Agent, AgentData } from "~/database/entities";
import { CompositeAgentId } from "~/database/repositories/AgentRepo";
import { BaseRepo } from "~/database/repositories/BaseRepo";

@EntityRepository(AgentData)
export class AgentDataRepo extends BaseRepo<AgentData> {
  public async findForAgent(agent: Agent | CompositeAgentId): Promise<AgentData[]> {

    return this.find({
                       where: {
                         agent: {
                           ...{
                             id: agent.id,
                             uuid: agent.uuid,
                           },
                         },
                       },
                     });
  }
}
