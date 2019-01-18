## Entity

An entity provides an easy way to match generic things more easily. This is for example
useful when you want to match a positive or negative response, or to use when you hava a finite list
like all provinces in the netherlands.

#### Fields

|name| type | description |
| ---- | ---- | ---- |
| [entity-name] | `Object` | The name of the new entity |
| .autoExpand | `?Boolean` | If this entity automatically should grow. This should almost always be false |
| .[key-name] | `Array<string>` | A 'key' you want to match in a intent#trigger. The values of the array are other variants of this key. |


#### Examples

Basic example:

```YML
# entities/basic_entity.yml
provinces:
  provinces:
      - Groningen
      - Friesland
      - ...
```


Multiple keys:

```YML
# entities/multiple_keys.yml
food:
    # You often want this on false.
    # Because its hard to add every possibility of food to this entity
    # we set this to true.
    autoExpand: true
    fruit:
        - apples
        - peer
        - bananas
    vegetables:
        - carrots
        - tomato
        - tomatos
```
