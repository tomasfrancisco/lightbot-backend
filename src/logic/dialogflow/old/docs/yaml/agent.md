
## Agent

Agents are the root of a chatbot. They provide a name, description and
define in which languages this chatbot is available.

#### Fields

|name| type | description |
| ---- | ---- | ---- |
| **name** | `string` | The name of the chatbot
|  **description** |  `string`  | A short description for this chatbot. |
| **languages** | `Array<string>` |  The languages this chatbot supports. |
|  **fulfillment** |  `Object`  | Fulfillment handler. This is needed when you want your chatbot to give back information from outside. |
| **fulfillment.url** | `string` | The URL string. |
|  **fulfillment.authorization** |  `string`  | The authorization token for this client. |
| **gcpProject** | `?string` | GCP Project name, if exists will try to auto upload agent after converting. |

#### Examples

``` yml
#agent.yaml
name: ExampleBot
description: This bot is only used as an example and will not be deployed i guess.
languages:
  - en
fulfillment:
  url: https://api.lightbot.io/v1/example/example
  authorization: NonExistingAuthToken
```
