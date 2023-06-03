import arweaveGql, { Transaction } from "arweave-graphql";
import { isVouched } from "./isVouched";
import { config } from "../config";
import { Account } from "../types";
import { abbreviateAddress } from "../utils";

export const getAccount = async (address: string, gateway?: string) => {
  try {
    const res = await arweaveGql(
      `${gateway || config.gatewayUrl}/graphql`
    ).getTransactions({
      tags: [
        { name: "Content-Type", values: ["application/json"] },
        { name: "Protocol", values: ["PermaProfile-v0.1"] },
      ],
    });
    const data = res.transactions.edges
      .filter((edge) => edge.node.owner.address === address)
      .map((edge) => transform(edge.node as Transaction));

    const metadata = await Promise.all(data);
    console.log("metadata", metadata);

    if (metadata.length >= 1) {
      return metadata[0];
    } else {
      const vouched = await isVouched(address);
      const slicedAddress = address.slice(0, 3) + address.slice(39, 42);
      return {
        address,
        handle: abbreviateAddress({ address }),
        uniqueHandle: `user#${slicedAddress}`,
        bio: "No bio.",
        avatar: undefined,
        banner: undefined,
        vouched,
      };
    }
  } catch (error) {
    console.error(error);
    throw new Error("Error occured whilst fetching data");
  }
};

const transform = async (node: Transaction): Promise<Account> => {
  const address = node.owner.address;
  const handle = node.tags.find((x) => x.name === "Profile-Name")?.value;
  const slicedAddress = address.slice(0, 3) + address.slice(39, 42);
  const uniqueHandle = handle
    ? `${handle}#${slicedAddress}`
    : `user#${slicedAddress}`;
  const bio = node.tags.find((x) => x.name === "Profile-Bio")?.value;
  const avatar = node.tags.find((x) => x.name === "Profile-Avatar")?.value;
  const banner = node.tags.find((x) => x.name === "Profile-Background")?.value;
  const vouched = await isVouched(address);

  return {
    address,
    handle,
    uniqueHandle,
    bio,
    avatar,
    banner,
    vouched,
  };
};
