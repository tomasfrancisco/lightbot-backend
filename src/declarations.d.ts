type SmartPromise<ReturnType, HasError> = Promise<
  HasError extends null | undefined ? ReturnType | undefined : ReturnType
>;
