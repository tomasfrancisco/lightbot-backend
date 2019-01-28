import { EntityRepository } from "typeorm";
import { Agent, AgentData } from "~/database/entities";
import { CompositeAgentId } from "~/database/repositories/AgentRepo";
import { BaseRepo } from "~/database/repositories/BaseRepo";
import { getAgentRepo } from "~/database/repositories/index";

@EntityRepository(AgentData)
export class AgentDataRepo extends BaseRepo<AgentData> {
  public async findForAgent(agent: Agent | CompositeAgentId): Promise<AgentData[]> {
    return this.createQueryBuilder("data")
      .leftJoin("data.agent", "agent")
      .where("agent.id = :id")
      .orWhere("agent.uuid = :uuid")
      .setParameters({
        id: agent.id || -1,
        uuid: agent.uuid || "",
      })
      .getMany();
  }

  public async addForAgent(
    agentUUID: string,
    key: string,
    data: string,
  ): Promise<AgentData> {
    const agent = await getAgentRepo().findOneById({ uuid: agentUUID }, new Error());

    return this.save(
      this.create({
        agent,
        key,
        data,
      }),
    );
  }
}
