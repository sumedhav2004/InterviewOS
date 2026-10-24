import { FriendRequestStatus } from "@interview-os/database";

export type UpdateFriendRequestData = {
  status: FriendRequestStatus;
  respondedAt?: Date;
};
