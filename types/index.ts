export interface Comment {
  comment: string;
  sourceTx: string;
}

export interface Account {
  address: string;
  handle: string | undefined;
  uniqueHandle: string | undefined;
  bio: string | undefined;
  avatar: string | undefined;
  banner: string | undefined;
  vouched: boolean;
}
