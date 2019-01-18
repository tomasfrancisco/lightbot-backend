/* tslint:disable:no-object-literal-type-assertion */
import { HttpError } from "~/server";
import { Context, notFoundHandler } from "~/server/middleware";

test("Should call next", async () => {
  const nextMock = jest.fn(() => Promise.resolve());
  await notFoundHandler({ status: 200 } as Context, nextMock);
  expect(nextMock).toBeCalled();
});

test("Should not throw when context has a status", async () =>
  expect(
    notFoundHandler({ status: 300 } as Context, () => Promise.resolve()),
  ).resolves.toBeUndefined());

test("Should throw 404 without status", async () =>
  expect(notFoundHandler({} as Context, () => Promise.resolve())).rejects.toThrow(
    HttpError.notFoundError(),
  ));
