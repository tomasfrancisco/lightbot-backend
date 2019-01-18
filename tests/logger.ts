import { logger, LogLevel } from "~/logger";

const spyError = jest.spyOn(console, "error");
const spyLog = jest.spyOn(console, "log");
const spyDebug = jest.spyOn(console, "debug");

// tslint:disable-next-line:no-string-literal
const originalLogLevel = logger["logLevel"];

beforeEach(() => {
  spyError.mockReset();
  spyLog.mockReset();
  spyDebug.mockReset();
});

afterAll(() => logger.setLogLevel(originalLogLevel));

const logAll = (thing: string) => {
  logger.debug(thing);
  logger.log(thing);
  logger.error(thing);
};

test("Log methods prefix severity", () => {
  // Also generates a console.debug.
  logger.setLogLevel(LogLevel.DEBUG);
  spyDebug.mockReset();

  logAll("severity");

  expect(spyError).toHaveBeenCalledTimes(1);
  expect(spyLog).toHaveBeenCalledTimes(1);
  expect(spyDebug).toHaveBeenCalledTimes(1);

  expect(spyError).toHaveBeenCalledWith(expect.any(String), "[ERROR]", "severity");
  expect(spyLog).toHaveBeenCalledWith(expect.any(String), "[INFO]", "severity");
  expect(spyDebug).toHaveBeenCalledWith(expect.any(String), "[DEBUG]", "severity");
});

test("All methods print on LogLevel.DEBUG", () => {
  // Also generates a console.debug.
  logger.setLogLevel(LogLevel.DEBUG);
  spyDebug.mockReset();

  logAll("test");

  expect(spyError).toHaveBeenCalledTimes(1);
  expect(spyLog).toHaveBeenCalledTimes(1);
  expect(spyDebug).toHaveBeenCalledTimes(1);
});

test("Info and error print on LogLevel.INFO", () => {
  // Also generates a console.log
  logger.setLogLevel(LogLevel.INFO);
  spyLog.mockReset();

  logAll("test");

  expect(spyError).toHaveBeenCalledTimes(1);
  expect(spyLog).toHaveBeenCalledTimes(1);
  expect(spyDebug).toHaveBeenCalledTimes(0);
});

test("Error print on LogLevel.ERROR", () => {
  // Also generates a console.error
  logger.setLogLevel(LogLevel.ERROR);
  spyError.mockReset();

  logAll("test");

  expect(spyError).toHaveBeenCalledTimes(1);
  expect(spyLog).toHaveBeenCalledTimes(0);
  expect(spyDebug).toHaveBeenCalledTimes(0);
});
