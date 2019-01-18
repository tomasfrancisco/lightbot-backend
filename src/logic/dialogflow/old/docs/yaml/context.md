
## Context

Context are a way to transport variables and manage conversation flow.
Every intent can have multiple 'in' and 'out' contexts.
The 'in' contexts specify the required active objects before that intent can trigger.
The 'out' contexts can manage the lifespan of an context.

#### Fields

| name | type | description |
| ---- | ---- | ---- |
[ [intent-name] ] | `string` | The intent you want to 'manage' |
| .in | `Array<string>` | All required contexts for this intent to be triggered |
| .out | `Array<string|Object>` | Output contexts |

#### Examples

```YML
# context.yml

startIntent:
    out:
      - niceUser

niceUserIntent:
    in:
      - niceUser
    out:
      - name: niceUser
        # Lifespan manages how many intent matches this context should survive without matching
        lifespan: 2

```
