import { isNil, reduce } from "lodash";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Agent } from "./Agent";
import { BaseEntity, orderBy } from "./BaseEntity";

export interface AgentDataObject {
  /**
   * The agent id for this data
   */
  agentId?: number;
  /**
   * Agent name
   */
  name?: string;
  /**
   * GCP Project data for auto bot deployment
   */
  gcpData?: Record<string, any>;
  /**
   * Token used by dialogflow to use custom fulfillment
   */
  fulfillmentToken?: string;
  /**
   * Token used to query dialogflow with a human request
   */
  dialogFlowAccessToken?: string;
  /**
   * Token used to sent chat to chatbase
   */
  analyticsToken?: string;
  /**
   * Custom theme for this agent
   */
  widgetThemeData?: Record<string, string>;
  /**
   * Teaser to show next to widget-hotspot
   */
  widgetTeaser?: string;
  /**
   * Message to show in the text field where user will type the questions
   */
  widgetInputPlaceholder?: string;
  /**
   * Hostspot icon for the widget
   */
  widgetHotspotIcon?: string;

  /**
   * The platform this bot is deployed on lastly. Rasa or Dialogflow
   */
  deployedOnPlatform?: string;

  [s: string]: number | string | Record<string, string> | Record<string, any> | undefined;
}

@Entity({ orderBy })
@Index("idx_agent_key", ["agent", "key"], { unique: true })
export class AgentData extends BaseEntity {
  public static toObject(agentId: number, data: AgentData[]): AgentDataObject {
    const obj = reduce(
      data,
      (previousValue: AgentDataObject, currentValue: AgentData) => {
        previousValue[currentValue.key] = currentValue.data;

        return previousValue;
      },
      { agentId } as AgentDataObject,
    );
    if (!isNil(obj.widgetThemeData)) {
      obj.widgetThemeData = JSON.parse(obj.widgetThemeData as any);
    }
    if (!isNil(obj.gcpData)) {
      obj.gcpData = JSON.parse(obj.gcpData as any);
    }

    return obj;
  }

  @ManyToOne(type => Agent, agent => agent.data)
  @JoinColumn()
  public agent!: Agent;

  @Column({
    type: "varchar",
  })
  public key!: string;

  @Column({
    type: "text",
  })
  public data: string = "";
}
