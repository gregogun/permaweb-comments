import { Tag } from "arweave-graphql";
import { formatDistance } from "date-fns";

// export const timeAgo = (date: number | undefined) => {
//   if (!date || Number.isNaN(date)) {
//     return;
//   }
//   return formatDistance(new Date(date), new Date(), {
//     addSuffix: true,
//   }).replace("about", "");
// };

export const timeAgo = (unixTimestamp: number | string | undefined) => {
  if (!unixTimestamp) {
    return;
  }

  const timestamp =
    typeof unixTimestamp === "number" ? unixTimestamp : Number(unixTimestamp);

  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  const now = Date.now();

  // check if unixTimestamp is in the future
  if (timestamp > now) {
    // console.log("future time");
    console.error("The provided timestamp is in the future.");

    return;
  }

  const differenceInSeconds = Math.round(now - timestamp) / 1000;

  if (differenceInSeconds < minute)
    return Math.floor(differenceInSeconds) + "s";
  else if (differenceInSeconds < hour)
    return Math.floor(differenceInSeconds / minute) + "m";
  else if (differenceInSeconds < day)
    return Math.floor(differenceInSeconds / hour) + "h";
  else if (differenceInSeconds < month)
    return Math.floor(differenceInSeconds / day) + "d";
  else if (differenceInSeconds < year)
    return Math.floor(differenceInSeconds / month) + "mo";
  else return Math.floor(differenceInSeconds / year) + "y";
};

interface AbbreviateAddressOptions {
  startChars?: number;
  endChars?: number;
  noOfEllipsis?: number;
}

interface AbbreviateAddress {
  address: string | undefined;
  options?: AbbreviateAddressOptions;
}

export const abbreviateAddress = ({
  address,
  options = {},
}: AbbreviateAddress) => {
  const { startChars = 5, endChars = 4, noOfEllipsis = 2 } = options;

  const dot = ".";
  const firstFive = address?.substring(0, startChars);
  const lastFour = address?.substring(address.length - endChars);
  return `${firstFive}${dot.repeat(noOfEllipsis)}${lastFour}`;
};
