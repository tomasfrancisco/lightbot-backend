/* tslint:disable:no-object-literal-type-assertion */
import * as Koa from "koa";
import { Context, requestLogger } from "~/server/middleware";

test("Should call next", async () => {
  const nextMock = jest.fn(() => Promise.resolve());
  await requestLogger(
    {
      response: {
        length: 5,
      } as Koa.Response,
    } as Context,
    nextMock,
  );
  expect(nextMock).toBeCalled();
});

test("should print info", async () => {
  const spyLog = jest.spyOn(console, "log");

  await requestLogger(
    {
      response: {
        length: 5,
      } as Koa.Response,
    } as Context,
    () => Promise.resolve(undefined),
  );
  expect(spyLog).toHaveBeenCalledTimes(1);
});

test("should handle empty body", async () => {
  const spyLog = jest.spyOn(console, "log");

  await requestLogger(
    {
      status: 200,
    } as Context,
    () => Promise.resolve(undefined),
  );
  expect(spyLog).toHaveBeenCalledTimes(1);
});
