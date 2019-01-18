const Visitor = require("./Visitor");
const _ = require("lodash");
const { Entity, Intent } = require("../models");

/**
 * Normalize entities and intents,
 * creates fallbacks for the intents that have specified it
 */
class Transformer extends Visitor {
  visitAgent(agent) {
    agent.data = agent.fileData;
    return agent;
  }

  visitEntity(entity) {
    return this.normalizeArray("entities", [entity.fileData]).map(it => {
      const ent = new Entity(entity.fileData);
      ent.data = it;
      return ent;
    });
  }

  visitIntent(intent) {
    const newData = this.normalizeArray("stories", [intent.fileData]).map(it => {
      const int = new Intent(intent.fileData);
      int.data = it;
      return int;
    });

    const fallbacks = [];
    newData.forEach(it => {
      const fallbackIntent = this.generateFallback(it.data);
      if (!_.isNil(fallbackIntent)) {
        fallbacks.push(fallbackIntent);
      }
    });

    newData.push(...fallbacks);
    return newData;
  }

  /**
   * If intent has an property fallback that has a string value.
   * Generate a child of the current intent and put it in the array.
   * This child will automatically trigger its parent via an event
   */
  generateFallback(intent) {
    if (_.isNil(intent.fallback) || _.isBoolean(intent.fallback)) {
      return;
    }

    let fallbackName = `${intent.name}_fallback`;
    if (_.isString(intent.fallback)) {
      fallbackName = intent.fallback;
    }
    if (_.isPlainObject(intent.fallback)) {
      fallbackName = intent.fallback.name || fallbackName;
    }
    const parentName = intent.name;

    const fallbackIntent = {
      name: fallbackName,
      parent: parentName,
      fallback: true,
      action: `fireEvent-${parentName}_event`,
    };
    if (_.isPlainObject(intent.fallback) && _.isArray(intent.fallback.triggers)) {
      fallbackIntent.triggers = intent.fallback.triggers;
    }

    if (_.isNil(intent.events) || !_.isArray(intent.events)) {
      intent.events = [];
    }
    intent.events.push(`${parentName}_event`);
    return fallbackIntent;
  }

  /**
   * Flattens an array of 'one-key' objects and places that one key in the object it self under 'name'
   * Example input: [{intents: [{key: {}}, {otherKey: {}}]},{moreKeys: {}}]
   * Example output: [{name: key}, {name: otherKey}, {name: moreKeys}]
   *
   *
   * @param name {string} Name of the possible keys for the sub array
   * @param objects The input array
   * @returns {Array}
   */
  normalizeArray(name, objects) {
    const newObjects = [];

    for (const obj of objects) {
      if (_.has(obj, name)) {
        newObjects.push(...this.normalizeArray(name, _.get(obj, name, [])));
        continue;
      }
      if (Object.keys(obj).length !== 1) {
        throw new Error(`Expecting ${name} to have one top level key!`);
      }
      const [objName] = Object.keys(obj);
      const newObj = { ...obj[objName] };
      newObj.name = objName;
      newObjects.push(newObj);
    }

    return newObjects;
  }
}

module.exports = Transformer;
