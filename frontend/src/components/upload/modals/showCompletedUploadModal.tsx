import { Box, Button, Group, Stack, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";
import { ModalsContextProps } from "@mantine/modals/lib/context";
import moment from "moment";
import { useRouter } from "next/router";
import { FormattedMessage } from "react-intl";
import { TbCheck } from "react-icons/tb";
import useTranslate from "../../../hooks/useTranslate.hook";
import { CompletedShare } from "../../../types/share.type";
import toast from "../../../utils/toast.util";
import CopyTextField from "../CopyTextField";

const showCompletedUploadModal = (
  modals: ModalsContextProps,
  share: CompletedShare,
) => {
  return modals.openModal({
    closeOnClickOutside: false,
    withCloseButton: false,
    closeOnEscape: false,
    title: null,
    size: 560,
    padding: 0,
    radius: 14,
    styles: {
      content: {
        overflow: "hidden",
        boxShadow: "0 30px 80px rgba(20, 22, 24, 0.24)",
      },
      body: {
        padding: 0,
      },
    },
    children: <Body share={share} />,
  });
};

const Body = ({ share }: { share: CompletedShare }) => {
  const modals = useModals();
  const router = useRouter();
  const t = useTranslate();

  const isReverseShare = !!router.query["reverseShareToken"];

  const link = `${window.location.origin}/s/${share.id}`;
  const pickupCode = share.id.slice(0, 8);
  const codeParts = share.id.slice(0, 8).toUpperCase().padEnd(8, "0").split("");

  return (
    <Stack
      align="stretch"
      spacing={22}
      sx={{
        padding: "34px",
        background: "linear-gradient(180deg, #fffaf0 0%, #ffffff 38%)",
      }}
    >
      <Stack align="center" spacing={4}>
        <Box
          sx={{
            width: 112,
            height: 112,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: "#ffd84d",
            boxShadow: "0 18px 36px rgba(226, 179, 20, 0.24)",
            color: "#161616",
            fontSize: 58,
            fontWeight: 900,
          }}
        >
          <TbCheck />
        </Box>
      </Stack>

      <Box
        sx={{
          border: "1px solid rgba(24, 25, 27, 0.08)",
          borderRadius: 12,
          background: "#fff",
          padding: 18,
        }}
      >
        <CopyTextField link={link} />
        <Text size="xs" color="dimmed" mt={14} weight={700}>
          Share code
        </Text>
        <Group
          spacing={8}
          mt={8}
          noWrap
          sx={{ cursor: "pointer" }}
          onClick={() => {
            navigator.clipboard.writeText(pickupCode);
            toast.success("已复制该取件码");
          }}
        >
          {codeParts.map((part, index) => (
            <Box
              key={`${part}-${index}`}
              sx={{
                width: 42,
                height: 42,
                borderRadius: 8,
                display: "grid",
                placeItems: "center",
                background: "#fff0a8",
                color: "#1a1a1a",
                fontSize: 18,
                fontWeight: 900,
              }}
            >
              {part}
            </Box>
          ))}
        </Group>
      </Box>
      {share.notifyReverseShareCreator === true && (
        <Text
          size="sm"
          sx={(theme) => ({
            color:
              theme.colorScheme === "dark"
                ? theme.colors.gray[3]
                : theme.colors.dark[4],
          })}
        >
          {t("upload.modal.completed.notified-reverse-share-creator")}
        </Text>
      )}
      <Text
        size="xs"
        align="center"
        sx={(theme) => ({
          color: theme.colors.gray[6],
        })}
      >
        {/* If our share.expiration is timestamp 0, show a different message */}
        {moment(share.expiration).unix() === 0
          ? t("upload.modal.completed.never-expires")
          : t("upload.modal.completed.expires-on", {
              expiration: moment(share.expiration).format("LLL"),
            })}
      </Text>

      <Button
        h={52}
        radius={8}
        sx={{
          background: "#171717",
          fontWeight: 900,
          "&:hover": {
            background: "#2b2b2b",
          },
        }}
        onClick={() => {
          modals.closeAll();
          if (isReverseShare) {
            router.reload();
          } else {
            router.push("/upload");
          }
        }}
      >
        <FormattedMessage id="common.button.done" />
      </Button>
    </Stack>
  );
};

export default showCompletedUploadModal;
