import { arweave } from "./arweave";
import arweaveGql, { GetTransactionsQueryVariables } from "arweave-graphql";
import { config } from "../config";
import { Comment } from "../types";
import { getAccount } from "./account";

export const writeReply = async ({ comment, sourceTx }: Comment) => {
  try {
    const savedTx = await arweave.createTransaction({
      data: comment,
    });
    savedTx.addTag("Content-Type", "text/plain");
    savedTx.addTag("Data-Protocol", "Comment");
    savedTx.addTag("Type", "comment-reply");
    savedTx.addTag("Variant", "0.0.1-alpha");
    savedTx.addTag("Published", Date.now().toString());
    savedTx.addTag("App-Name", "Permaweb-Comments");
    savedTx.addTag("Data-Source", sourceTx);

    const savedTxResult = await window.arweaveWallet.dispatch(savedTx);
    return savedTxResult;
  } catch (error) {
    throw new Error(error as any);
  }
};

interface CommentQueryParams {
  sourceTx: string;
  cursor?: string;
  limit?: number;
}

export const readReply = async ({
  sourceTx,
  cursor,
  limit,
}: CommentQueryParams) => {
  // if (!sourceTx) {
  //   throw new Error("No source transaction ID found");
  // }

  const query: GetTransactionsQueryVariables = {
    first: limit || 3,
    tags: [
      { name: "Content-Type", values: ["text/plain"] },
      { name: "Variant", values: ["0.0.1-alpha"] },
      { name: "Data-Protocol", values: ["Comment"] },
      { name: "App-Name", values: ["Permaweb-Comments"] },
      { name: "Type", values: ["comment-reply"] },
      { name: "Data-Source", values: [sourceTx] },
    ],
  };

  if (cursor) {
    query.after = cursor;
  }

  try {
    const metaRes = await arweaveGql(
      `${config.gatewayUrl}/graphql`
    ).getTransactions({
      ...query,
    });

    const metadata = metaRes.transactions.edges
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
    const hasNextPage = metaRes.transactions.pageInfo.hasNextPage;

    return {
      data,
      hasNextPage,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Error occured whilst fetching data");
  }
};
