import "jest-extended";
/* tslint:disable:no-object-literal-type-assertion */
import { HttpError } from "~/server";
import { Context, errorHandler } from "~/server/middleware";

test("Should call next", async () => {
  const nextMock = jest.fn(() => Promise.resolve());
  await errorHandler({} as Context, nextMock);
  expect(nextMock).toBeCalled();
});

test("Should catch thrown errors", async () =>
  expect(() =>
    errorHandler({} as Context, () =>
      Promise.resolve().then(() => {
        throw new Error("My Error");
      }),
    ),
  ).not.toThrow());

test("Should print error message", async () => {
  const spyError = jest.spyOn(console, "error");
  await errorHandler({} as Context, () =>
    Promise.resolve().then(() => {
      throw new HttpError(500, "internal error");
    }),
  );
  // Only HttpError#code and HttpError#message in 1 log call
  expect(spyError).toHaveBeenCalledTimes(1);
});

test("Should print original error", async () => {
  const spyError = jest.spyOn(console, "error");
  await errorHandler({} as Context, () =>
    Promise.resolve().then(() => {
      throw new HttpError(500, "internal error", new Error("message."));
    }),
  );
  // First Logger#error call with HttpError info
  // Second Logger#error call with HttpError#originalError
  expect(spyError).toHaveBeenCalledTimes(2);
});

test("Should set body and status", async () => {
  const ctx = {} as Context;
  await errorHandler(ctx, () =>
    Promise.resolve().then(() => {
      throw new HttpError(404, "Not found.");
    }),
  );

  expect(ctx.body).toBeObject();
  expect(ctx.status).toEqual(404);
  expect(ctx.body.message).toBeString();
  expect(ctx.body.message).toEqual("Not found.");
});

test("Should mask internal errors", async () => {
  const ctx = {} as Context;
  await errorHandler(ctx, () =>
    Promise.resolve().then(() => {
      throw new Error("Secret!.");
    }),
  );

  expect(ctx.status).toEqual(500);
  expect(ctx.body).toBeObject();
  expect(ctx.body.message).not.toEqual("Secret!.");
});

test("Default errors", async () => {
  expect(HttpError.notFoundError().code).toEqual(404);
  expect(HttpError.internalServerError("", new Error()).code).toEqual(500);
});
