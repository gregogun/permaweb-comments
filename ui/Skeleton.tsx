import { keyframes, styled } from "@aura-ui/react";

const loading = keyframes({
  "0%": { backgroundPosition: "200% 0" },
  "100%": { backgroundPosition: "-200% 0" },
});

export const Skeleton = styled("div", {
  width: 120,
  br: "$3",
  height: 44,
  backgroundImage:
    "linear-gradient(270deg, hsl(109, 0%, 6%), hsl(109, 0%, 9%), hsl(109, 0%, 9%), hsl(109, 0%, 6%))",
  backgroundSize: "400% 100%",
  animation: `${loading} 5s ease-in-out infinite`,
});
