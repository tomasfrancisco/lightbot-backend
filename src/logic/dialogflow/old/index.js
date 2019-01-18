const Converter = require("./Converter");
const { Validator } = require("./util");

module.exports.run = Converter.run.bind(Converter);
module.exports.runFromData = Converter.runFromData.bind(Converter);
module.exports.Converter = Converter;
module.exports.Validator = Validator;
