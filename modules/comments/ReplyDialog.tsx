import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Box,
  Button,
  Flex,
  Textarea,
  DialogClose,
  IconButton,
  Typography,
} from "@aura-ui/react";
import { FormikErrors, useFormik } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { abbreviateAddress } from "../../utils";
import { Comment } from "../../types";
import { writeComment } from "../../lib/comments";
import { useConnect } from "arweave-wallet-ui-test";
import { RxCross2 } from "react-icons/rx";
import { config } from "../../config";
import { writeReply } from "../../lib/replies";

interface ReplyDialogProps {
  open: boolean;
  onClose: () => void;
  commentTx: string | undefined;
  commentor: string | undefined;
}

export const ReplyDialog = ({
  open,
  onClose,
  commentTx,
  commentor,
}: ReplyDialogProps) => {
  const [submitting, setSubmitting] = useState(false);
  const { profile, walletAddress } = useConnect();
  const queryClient = useQueryClient();

  const commentLabel = walletAddress ? "Reply" : "Connect to reply";

  const formik = useFormik<Pick<Comment, "comment">>({
    initialValues: {
      comment: "",
    },
    validateOnBlur: false,
    validateOnChange: false,
    validate: (values) => {
      const errors: FormikErrors<Pick<Comment, "comment">> = {};

      if (values.comment && values.comment.length < 3) {
        errors.comment = "Comment must be a minimum of 3 characters.";
      }

      if (values.comment && values.comment.length > 300) {
        errors.comment = "Comment must be a maximum of 300 characters.";
      }

      if (submitting) {
        setSubmitting(false);
      }
      return errors;
    },
    onSubmit: async (values, { setErrors, validateForm }) => {
      setSubmitting(true);
      validateForm();

      document.body.style.pointerEvents = "auto";

      const wallet = await window.arweaveWallet;

      if (!wallet) {
        setErrors({ comment: "Connect a wallet to comment." });
        return;
      }

      if (!commentTx) {
        setErrors({ comment: "No tx for target comment found" });
        return;
      }

      commentMutation.mutate({
        comment: values.comment as string,
        sourceTx: commentTx,
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: writeReply,
    onSuccess: (data) => {
      if (submitting) {
        setSubmitting(false);
      }
      //   setCommentSuccess(
      //     `Comment successfully created: ${abbreviateAddress({
      //       address: data.id,
      //     })}`
      //   );

      // we do this to give data time to be read back from network
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: [`comment-reply-for${commentTx}`],
        });
      }, 250);

      formik.resetForm();
      onClose();
    },
    onError: (error: any) => {
      if (submitting) {
        setSubmitting(false);
      }
      console.error(error);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        queryClient.invalidateQueries({
          queryKey: [`comment-reply-for${commentTx}`],
        });
        formik.resetForm();
        onClose();
      }}
    >
      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          css={{
            p: 2,
            left: "47%",
          }}
        >
          <Flex
            as="form"
            onSubmit={formik.handleSubmit}
            css={{
              p: "$3",
              boxShadow: "0 0 0 1px $colors$slate3",
              br: "$3",

              "&:hover": {
                boxShadow: "0 0 0 1px $colors$slate4",
              },

              "&:focus-within": {
                boxShadow: "0 0 0 2px $colors$indigo10",
              },
            }}
            direction="column"
            gap="2"
          >
            <Flex gap="2">
              {walletAddress && (
                <Box
                  css={{
                    pt: "$1",
                  }}
                >
                  <Avatar size="3">
                    <AvatarImage
                      src={
                        profile?.avatar
                          ? profile.avatar
                          : `https://source.boringavatars.com/marble/40/${walletAddress}`
                      }
                    />
                    <AvatarFallback>
                      {walletAddress.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Box>
              )}
              <Textarea
                css={{
                  flex: 1,

                  boxShadow: "none",
                  minHeight: 100,
                  resize: "none",

                  "&:hover": {
                    boxShadow: "none",
                  },

                  "&:focus": {
                    boxShadow: "none",
                  },
                }}
                name="comment"
                value={formik.values.comment}
                onChange={formik.handleChange}
                required
                minLength={3}
                maxLength={300}
                variant="outline"
                placeholder={`Replying to ${commentor}`}
              />
            </Flex>
            <Button
              type="submit"
              disabled={submitting || !walletAddress || !formik.values.comment}
              css={{ alignSelf: "end" }}
              variant="solid"
              colorScheme="indigo"
            >
              {submitting ? "Submitting..." : commentLabel}
            </Button>
          </Flex>
          <DialogClose asChild>
            <IconButton
              size="1"
              css={{
                br: "$round",
              }}
            >
              <RxCross2 />
            </IconButton>
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
