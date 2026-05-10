import { Box, createStyles, Group, Text, Title } from "@mantine/core";
import { useModals } from "@mantine/modals";
import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import Meta from "../../../components/Meta";
import DownloadAllButton from "../../../components/share/DownloadAllButton";
import FileList from "../../../components/share/FileList";
import showEnterPasswordModal from "../../../components/share/showEnterPasswordModal";
import showErrorModal from "../../../components/share/showErrorModal";
import useTranslate from "../../../hooks/useTranslate.hook";
import shareService from "../../../services/share.service";
import { Share as ShareType } from "../../../types/share.type";
import toast from "../../../utils/toast.util";
import { byteToHumanSizeString } from "../../../utils/fileSize.util";

const useStyles = createStyles(() => ({
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 16% 18%, rgba(255, 216, 77, 0.42) 0 10%, transparent 11%), linear-gradient(135deg, #f7f2e8 0%, #f1dfaf 48%, #d4e4ea 100%)",
    padding: "24px",
    color: "#181818",
    "@media (max-width: 640px)": {
      padding: "16px",
    },
  },
  nav: {
    minHeight: 52,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: 1120,
    margin: "0 auto 54px",
  },
  brand: {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    fontWeight: 900,
    fontSize: 20,
  },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "#171717",
    color: "#ffd84d",
    fontWeight: 900,
  },
  card: {
    maxWidth: 900,
    margin: "0 auto",
    borderRadius: 14,
    background: "rgba(255, 255, 255, 0.96)",
    border: "1px solid rgba(24, 25, 27, 0.08)",
    boxShadow: "0 26px 80px rgba(27, 31, 35, 0.16)",
    overflow: "hidden",
  },
  header: {
    padding: "32px",
    background: "linear-gradient(180deg, #fff8df 0%, #fff 100%)",
    borderBottom: "1px solid rgba(24, 25, 27, 0.08)",
    "@media (max-width: 640px)": {
      padding: "24px 18px",
    },
  },
  body: {
    padding: "26px 32px 34px",
    "@media (max-width: 640px)": {
      padding: "18px",
    },
  },
}));

export function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: { shareId: context.params!.shareId },
  };
}

const Share = ({ shareId }: { shareId: string }) => {
  const modals = useModals();
  const [share, setShare] = useState<ShareType>();
  const t = useTranslate();
  const { classes } = useStyles();

  const getShareToken = async (password?: string) => {
    await shareService
      .getShareToken(shareId, password)
      .then(() => {
        modals.closeAll();
        getFiles();
      })
      .catch((e) => {
        const { error } = e.response.data;
        if (error == "share_max_views_exceeded") {
          showErrorModal(
            modals,
            t("share.error.visitor-limit-exceeded.title"),
            t("share.error.visitor-limit-exceeded.description"),
            "go-home",
          );
        } else if (error == "share_password_required") {
          showEnterPasswordModal(modals, getShareToken);
        } else {
          toast.axiosError(e);
        }
      });
  };

  const getFiles = async () => {
    shareService
      .get(shareId)
      .then((share) => {
        setShare(share);
      })
      .catch((e) => {
        const { error } = e.response.data;
        if (e.response.status == 404) {
          if (error == "share_removed") {
            showErrorModal(
              modals,
              t("share.error.removed.title"),
              e.response.data.message,
              "go-home",
            );
          } else {
            showErrorModal(
              modals,
              t("share.error.not-found.title"),
              t("share.error.not-found.description"),
              "go-home",
            );
          }
        } else if (e.response.status == 403 && error == "private_share") {
          showErrorModal(
            modals,
            t("share.error.access-denied.title"),
            t("share.error.access-denied.description"),
          );
        } else if (error == "share_password_required") {
          showEnterPasswordModal(modals, getShareToken);
        } else if (error == "share_token_required") {
          getShareToken();
        } else {
          showErrorModal(
            modals,
            t("common.error"),
            t("common.error.unknown"),
            "go-home",
          );
        }
      });
  };

  useEffect(() => {
    getFiles();
  }, []);

  return (
    <Box className={classes.page}>
      <Meta
        title={t("share.title", { shareId: share?.name || shareId })}
        description={t("share.description")}
      />

      <Box className={classes.nav}>
        <Box className={classes.brand}>
          <Box className={classes.logoMark}>S</Box>
          <span>StellarTransfer</span>
        </Box>
        <Text size="sm" weight={800}>
          星闪包
        </Text>
      </Box>

      <Box className={classes.card}>
        <Group position="apart" align="flex-start" className={classes.header}>
          <Box style={{ maxWidth: 620 }}>
            <Text size="xs" weight={900} transform="uppercase" color="dimmed">
              Shared package
            </Text>
            <Title order={2} mt={6} sx={{ lineHeight: 1.15 }}>
              {share?.name || share?.id || shareId}
            </Title>
            {share?.description && (
              <Text size="sm" mt={10} color="dimmed">
                {share.description}
              </Text>
            )}
            {share?.files?.length > 0 && (
              <Text size="sm" color="dimmed" mt={10} weight={700}>
                <FormattedMessage
                  id="share.fileCount"
                  values={{
                    count: share?.files?.length || 0,
                    size: byteToHumanSizeString(
                      share?.files?.reduce(
                        (total: number, file: { size: string }) =>
                          total + parseInt(file.size),
                        0,
                      ) || 0,
                    ),
                  }}
                />
              </Text>
            )}
          </Box>

          {share?.files.length > 1 && <DownloadAllButton shareId={shareId} />}
        </Group>

        <Box className={classes.body}>
          <FileList
            files={share?.files}
            setShare={setShare}
            share={share!}
            isLoading={!share}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Share;
