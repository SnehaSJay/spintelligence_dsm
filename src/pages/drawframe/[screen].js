const SCREEN_TYPE_MAP = {
  cots: "Draw Frame Cots Data Entry",
  uqc: "U% Data Entry",
  "a-percent": "A%",
  header: "PP - Breaker Drawing",
  finisher: "PP - Finisher Drawing",
  "wheel-change": "Wheel Change",
};

export async function getServerSideProps(context) {
  const screen = String(context?.params?.screen || "").trim().toLowerCase();
  const type = SCREEN_TYPE_MAP[screen];

  if (!type) {
    return {
      notFound: true,
    };
  }

  return {
    redirect: {
      destination: `/draw-frame?type=${encodeURIComponent(type)}`,
      permanent: false,
    },
  };
}

export default function DrawFrameAliasPage() {
  return null;
}
