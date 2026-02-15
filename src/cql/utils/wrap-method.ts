// eslint-disable-next-line
export function wrapMethod<T extends (...args: any[]) => any>(
  // eslint-disable-next-line
  context: any,
  method: T,
): OmitThisParameter<T> {
  return ((...args: Parameters<T>) =>
    method.apply(context, args)) as OmitThisParameter<T>;
}
