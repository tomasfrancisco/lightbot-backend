import { logger } from "~/logger";

export * from "./env";

export const getCurrentDateSeconds = () => Math.floor(Date.now() / 1000);

// tslint:disable:typedef newline-before-return no-invalid-this only-arrow-functions
export function LogMethodTime(name: string) {
  return function logMethod(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function innerFn(...args: any[]) {
      const start = Date.now();
      return Promise.resolve(originalMethod.apply(this, args)).then(result => {
        logger.log("[Timing : Method]", name, ":", Date.now() - start, "ms");
        return result;
      });
    };

    return descriptor;
  };
}
