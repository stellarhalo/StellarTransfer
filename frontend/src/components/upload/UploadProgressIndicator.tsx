import { Box, Loader, RingProgress, Text } from "@mantine/core";
import { TbCircleCheck } from "react-icons/tb";
const UploadProgressIndicator = ({ progress }: { progress: number }) => {
  if (progress > 0 && progress < 100) {
    return (
      <Box sx={{ position: "relative", width: 46, height: 46 }}>
        <RingProgress
          sections={[{ value: progress, color: "yellow.5" }]}
          thickness={5}
          size={46}
          roundCaps
          styles={{
            root: {
              filter: "drop-shadow(0 8px 16px rgba(226, 179, 20, 0.18))",
            },
          }}
        />
        <Text
          size={9}
          weight={800}
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "#1b1b1b",
          }}
        >
          {Math.round(progress)}%
        </Text>
      </Box>
    );
  } else if (progress >= 100) {
    return (
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          background: "#ecf8ee",
        }}
      >
        <TbCircleCheck color="#27a844" size={24} />
      </Box>
    );
  } else {
    return (
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          background: "#fff7d8",
        }}
      >
        <Loader color="yellow" size={20} />
      </Box>
    );
  }
};

export default UploadProgressIndicator;
