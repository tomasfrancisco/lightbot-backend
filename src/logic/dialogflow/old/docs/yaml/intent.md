## Stories

A story is part of a conversation, consisting of at least one to a few intents. There are
a few ways to 'run' it. You can use 'events' to programmatically call them or use
'triggers' to run them based on what a user said. An intent also has multiple ways to
output. Programmatically via 'action' and text based via 'outputs'. Intents can use
'variables' to 'save' things that users say.

There is also a special kind of intent: the fallback intent. Lightbot-CLI could generate
this one for you if you specify the 'fallback'- property. This intent will run if no
iother intent is matched. You can use contexts and triggers to have more specific fallback
handling.

Dollar signs (`$`) are used as a start of a variable. They will be replaced by a value OR
variable.entityType OR directly as an entity.

#### Fields

| name          | type                    | description                                                                            |
| ------------- | ----------------------- | -------------------------------------------------------------------------------------- |
| [intent-name] | `Object`                | The name of the new intent                                                             |
| .parent       | `?string`               | Name of the parent of this intent                                                      |
| .events       | `?Array<string>`        | Event names that can run this intent                                                   |
| .triggers     | `?Array<string|Object>` | Things that users can say to run this intent. See examples                             |
| .variables    | `?Object`               | Values that can be used by the fulfillment or outputs. See examples.                   |
| .action       | `?string`               | Name of the method that will be called in the fulfillment                              |
| .outputs      | `?Array<string|Object>` | A list of outputs that this intent will return.                                        |
| .fallback     | `?string|boolean`       | If string, a fallback will be generated, if boolean: this intent is a fallback intent. |

One of `[events, triggers, fallback]` is required. One of `[action, outputs]` is required.

#### Examples

Basic example:

```YML
# intents/basic_intent.yaml
welcome:
    triggers:
        - Hello
        - Hi
    outputs:
        - Hi, i'm the example chatbot
```

Triggers:

```YML
# intents/triggers_example.yml
triggerExamples:
    triggers:
    # Basic (literally, exact match)
      - I'm 15 years old

    # Intermediate (basic system entity usage)
    # This matches any sentence with a number on the place of 'sys.number'
      - I'm $sys.number years old
    # Im cool level (use variables)
      - I'm $age years old
    # Advanced level (use substitutes)
      - input: I'm $age years old
        accepts:
            age:
              - 15
              - 48ish

    # See below for more variables examples
    variables:
        age:
          entityType: sys.number
          insists:
            - What is your age?
```

Variables:

```YML
# intents/variables_example.yml
variableExamples:
    triggers:
      - My age is
      - My age is $maybeAge
    variables:
    # Basic default value ( this is always available and does not have any impact on the triggers
        boolTrue:
          value: true
    # Normal variable (Variable is not required )
        maybeAge:
            entityType: sys.number
    # Required variable (It will as long as it does not match any other intent, ask the insists to get a correct value
        requiredAge:
          entityType: sys.number
          insists: # A random one will be picked from this list
            - What is your requiredAge?
            - Please tell me your requiredAge?

```

Outputs:

```YML
# intents/outputs_example.yml
outputExamples:
    triggers:
        - Hello
    outputs:
        - Hi i will always be displayed
        - choices: # A random one will be picked from this list
            - I'm possibility 1
            - Or maybe I will get a chance to shine.
        - url: https://example.com  # Some custom payload support
```

Action:

```YML
# intents/action_example.yml
actionExample:
    triggers:
       - Hello
    action: helloAction
    outputs:
        # It is adviced to put at least one sentence here for when the action fails. This is not needed when you have fallback intents
        - Sorry, i can't greet you correctly now :/
```
