export type AuthRequest = Express.Request & {
  headers: { authorization: string };
};
