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
import { BsPatchCheckFill } from "react-icons/bs";
import { Account } from "../../types";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { ReplyDialog } from "./ReplyDialog";
import { useInfiniteQuery } from "@tanstack/react-query";
import { readReply } from "../../lib/replies";
import { ReplyItem } from "./ReplyItem";
import { useMotionAnimate } from "motion-hooks";
import { stagger } from "motion";

interface CommentItemProps {
  owner: string | undefined;
  txid: string | undefined;
  published: string | undefined;
  account: Account | undefined;
  comment: string;
  isLastItem: boolean;
}

export const CommentItem = forwardRef<HTMLDivElement, CommentItemProps>(
  (
    { owner, published, account, comment, txid, isLastItem }: CommentItemProps,
    ref
  ) => {
    const [openReplyDialog, setOpenReplyDialog] = useState(false);
    const replyRef = useRef<HTMLDivElement | null>(null);
    const { play } = useMotionAnimate(
      ".reply",
      { opacity: 1 },
      {
        delay: stagger(0.075),
        duration: 0.75,
        easing: "ease-in-out",
      }
    );
    const {
      data: repliesData,
      isLoading: repliesLoading,
      isError: repliesError,
      fetchNextPage,
      hasNextPage: moreReplies,
      isFetchingNextPage,
    } = useInfiniteQuery({
      queryKey: [`comment-reply-for${txid}`],
      // cacheTime: 1 * 60 * 1000,
      enabled: !!txid,
      queryFn: ({ pageParam }) => {
        if (!txid) {
          throw new Error("No txid found");
        }

        return readReply({ sourceTx: txid, cursor: pageParam });
      },
      getNextPageParam: (lastPage) => {
        // check if we have more pages.
        if (!lastPage.hasNextPage) {
          return undefined;
        }

        // return the cursor of the last item on the last page.
        return lastPage.data[lastPage.data.length - 1].cursor;
      },
    });
    const name =
      account && account.handle
        ? account.handle
        : abbreviateAddress({ address: owner });

    const handleOpenReplyDialog = () => setOpenReplyDialog(true);
    const handleCancelReplyDialog = () => setOpenReplyDialog(false);

    const repliesList = repliesData?.pages.flatMap((page) => page.data);

    // Play the animation on mount of the component
    useEffect(() => {
      if (repliesList && repliesList.length > 0) {
        play();
      }
    }, [repliesData]);

    const hasReplies = repliesData && repliesData.pages[0]?.data?.length > 0;

    // useEffect(() => {
    //   if (repliesData && repliesData.pages[0]?.data?.length > 0) {
    //     console.log(repliesData?.pages[0]?.data[0].comment);
    //   }
    // }, [repliesData]);

    useEffect(() => {
      console.log(account);
    }, []);

    return (
      <Flex
        ref={ref}
        // className and opacity are for motion one animation
        className="comment"
        css={{
          opacity: 0,
          pt: isLastItem ? "$1" : "$3",
          pb: isLastItem || hasReplies ? 0 : "$2",
          position: "relative",
        }}
        gap="3"
      >
        <Flex direction="column" gap="2" align="center">
          <Avatar size="4">
            <AvatarImage
              src={
                account?.avatar
                  ? account?.avatar
                  : `https://source.boringavatars.com/marble/40/${owner}`
              }
            />
            <AvatarFallback>{name?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          {hasReplies && !isLastItem && (
            <Box
              css={{
                backgroundColor: "$slate6",
                flex: 1,
                width: 3,
                height: "100%",
              }}
            />
          )}
        </Flex>
        <Flex css={{ width: "100%" }} direction="column" gap="1">
          <Flex
            css={{
              height: "max-content",
              "& p": { lineHeight: 1 },
            }}
            align="center"
            gap="1"
          >
            <Typography contrast="hiContrast" weight="6">
              {name}
            </Typography>
            {account?.vouched && (
              <Flex
                align="center"
                justify="center"
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
              </Flex>
            )}
            {account?.uniqueHandle && (
              <Typography css={{ color: "$slate11" }}>
                {account.uniqueHandle}
              </Typography>
            )}
            <Typography size="2" css={{ color: "$slate11" }}>
              • {timeAgo(Number(published))}
            </Typography>
          </Flex>
          {comment && <Typography contrast="hiContrast">{comment}</Typography>}
          <Flex align="center" gap="4">
            <Button
              onClick={handleOpenReplyDialog}
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
              {/* <BsChat /> 1 */}
              Reply
            </Button>
            {/* <Button
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
            </Button> */}
          </Flex>
          <Flex css={{ mt: "$3" }} direction="column">
            {repliesData &&
              repliesData.pages.map((infinitePage, i) => (
                <React.Fragment key={i}>
                  {infinitePage.data.map((comment) => (
                    <ReplyItem
                      key={comment.txid}
                      txid={comment.txid}
                      owner={comment.owner}
                      published={comment.published}
                      comment={comment.comment}
                      account={comment.account}
                      commentTx={txid}
                      ref={replyRef}
                    />
                  ))}
                </React.Fragment>
              ))}
          </Flex>
        </Flex>

        <ReplyDialog
          commentTx={txid}
          open={openReplyDialog}
          onClose={handleCancelReplyDialog}
        />
      </Flex>
    );
  }
);
