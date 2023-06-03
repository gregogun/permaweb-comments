import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Box,
  Button,
  Flex,
  Typography,
} from "@aura-ui/react";
import { abbreviateAddress, timeAgo } from "../../utils";
import {
  BsChat,
  BsChatDotsFill,
  BsHeart,
  BsPatchCheckFill,
} from "react-icons/bs";
import { Account } from "../../types";
import React, { forwardRef, useEffect, useState } from "react";
import { ReplyDialog } from "./ReplyDialog";

interface ReplyItemProps {
  owner: string | undefined;
  txid: string | undefined;
  published: string | undefined;
  account: Account | undefined;
  comment: string;
  commentTx: string | undefined;
}

export const ReplyItem = forwardRef<HTMLDivElement, ReplyItemProps>(
  (
    { owner, published, account, comment, txid, commentTx }: ReplyItemProps,
    ref
  ) => {
    const [openReplyDialog, setOpenReplyDialog] = useState(false);
    const name =
      account && account.handle
        ? account.handle
        : abbreviateAddress({ address: owner });

    const handleOpenReplyDialog = () => setOpenReplyDialog(true);
    const handleCancelReplyDialog = () => setOpenReplyDialog(false);

    return (
      <Flex
        ref={ref}
        // className and opacity are for motion one animation
        className="reply"
        css={{
          opacity: 0,
          my: "$5",
          position: "relative",
        }}
        gap="3"
      >
        <Flex direction="column" gap="2" align="center">
          <Avatar size="4">
            <AvatarImage
              css={{
                border: "1px solid $colors$slate1",
              }}
              src={
                account?.avatar
                  ? account?.avatar
                  : `https://source.boringavatars.com/marble/40/${owner}`
              }
            />
            <AvatarFallback>{name?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Flex>
        <Flex css={{ width: "100%" }} direction="column">
          <Flex align="center" justify="between">
            <Flex gap="1">
              <Typography contrast="hiContrast" size="2" weight="6">
                {name}
              </Typography>
              {account?.vouched && (
                <Box
                  css={{
                    "& svg": {
                      fill: "$indigo11",
                      size: "$4",
                      verticalAlign: "middle",
                    },
                  }}
                  as="span"
                >
                  <BsPatchCheckFill />
                </Box>
              )}
              {account?.uniqueHandle && (
                <Typography size="2" css={{ color: "$slate11" }}>
                  {account.uniqueHandle}
                </Typography>
              )}
            </Flex>
            <Typography size="1" css={{ color: "$slate11" }}>
              {timeAgo(Number(published))}
            </Typography>
          </Flex>
          {comment && <Typography contrast="hiContrast">{comment}</Typography>}
          <Flex align="center" css={{ mt: "$2" }} gap="4">
            <Button
              onClick={handleOpenReplyDialog}
              size="1"
              css={{
                p: 0,
                lineHeight: 1,
                height: "max-content",
                backgroundColor: "transparent",
                fontSize: "$1",
                gap: "$2",

                "&:hover": {
                  backgroundColor: "transparent",
                  color: "$slate12",
                },

                "&:active": {
                  backgroundColor: "transparent",
                  color: "$slate12",
                },
              }}
            >
              <BsChat /> 1
            </Button>
            <Button
              size="1"
              css={{
                p: 0,
                lineHeight: 1,
                height: "max-content",
                backgroundColor: "transparent",
                fontSize: "$1",
                gap: "$2",

                "&:hover": {
                  backgroundColor: "transparent",
                  color: "$slate12",
                },

                "&:active": {
                  backgroundColor: "transparent",
                  color: "$slate12",
                },
              }}
            >
              <BsHeart /> 0
            </Button>
          </Flex>
        </Flex>

        <ReplyDialog
          commentTx={commentTx}
          open={openReplyDialog}
          onClose={handleCancelReplyDialog}
        />
      </Flex>
    );
  }
);
