import { arweave } from "./arweave";
import arweaveGql, { GetTransactionsQueryVariables } from "arweave-graphql";
import { config } from "../config";
import { Comment } from "../types";
import { getAccount } from "./account";

export const createComment = async ({ comment, sourceTx }: Comment) => {
  try {
    const tx = await arweave.createTransaction({
      data: comment,
    });
    tx.addTag("Content-Type", "text/plain");
    tx.addTag("Data-Protocol", "comment");
    tx.addTag("Published", Date.now().toString());
    tx.addTag("Data-Source", sourceTx);

    const txResult = await window.arweaveWallet.dispatch(tx);
    return txResult;
  } catch (error) {
    throw new Error(error as any);
  }
};

interface CommentQueryParams {
  sourceTx: string;
  cursor?: string;
  limit?: number;
}

export const getComments = async ({
  sourceTx,
  cursor,
  limit,
}: CommentQueryParams) => {
  const query: GetTransactionsQueryVariables = {
    first: limit || 3,
    tags: [
      { name: "Content-Type", values: ["text/plain"] },
      { name: "Data-Protocol", values: ["comment"] },
      { name: "Data-Source", values: [sourceTx] },
    ],
  };

  if (cursor) {
    query.after = cursor;
  }

  try {
    const res = await arweaveGql(
      `${config.gatewayUrl}/graphql`
    ).getTransactions({
      ...query,
    });

    const metadata = res.transactions.edges
      .filter((edge) => Number(edge.node.data.size) < 320)
      .filter(
        (edge) => edge.node.tags.find((x) => x.name === "Published")?.value
      )
      .map(async (edge) => {
        const owner = edge.node.owner.address;
        const txid = edge.node.id;
        const published = edge.node.tags.find(
          (x) => x.name === "Published"
        )?.value;
        const account = await getAccount(owner);
        const cursor = edge.cursor;
        const comment = await arweave.api
          .get(txid)
          .then((res) => res.data)
          .catch((error) => console.error(error));

        return {
          owner,
          txid,
          published,
          account,
          comment,
          cursor,
        };
      });

    const data = await Promise.all(metadata);
    const hasNextPage = res.transactions.pageInfo.hasNextPage;

    return {
      data,
      hasNextPage,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Error occured whilst fetching data");
  }
};
