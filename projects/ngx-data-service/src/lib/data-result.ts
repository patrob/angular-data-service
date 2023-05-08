export type DataResult<T> = {
  value?: T | T[] | undefined;
  error?: { message: string };
};

export const getDefaultDataResult = <T>(): DataResult<T> => ({});
