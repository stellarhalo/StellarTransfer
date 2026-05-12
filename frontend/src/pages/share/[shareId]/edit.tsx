import {
  Box,
  Button,
  createStyles,
  Group,
  LoadingOverlay,
  Text,
} from "@mantine/core";
import { useModals } from "@mantine/modals";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TbArrowLeft, TbExternalLink } from "react-icons/tb";
import Meta from "../../../components/Meta";
import showErrorModal from "../../../components/share/showErrorModal";
import EditableUpload from "../../../components/upload/EditableUpload";
import useConfirmLeave from "../../../hooks/confirm-leave.hook";
import useTranslate from "../../../hooks/useTranslate.hook";
import shareService from "../../../services/share.service";
import { Share as ShareType } from "../../../types/share.type";

const useStyles = createStyles((theme) => ({
  root: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f7f7f7 0%, #ffffff 52%, #f0f0f0 100%)",
    padding: "80px 20px 56px",

    [theme.fn.smallerThan("sm")]: {
      padding: "28px 16px",
    },
  },
  container: {
    width: "min(800px, 100%)",
    margin: "0 auto",
  },
  toolbar: {
    marginBottom: 20,
  },
  softButton: {
    height: 48,
    padding: "0 22px",
    borderRadius: 999,
    background: "#f6f6f6",
    color: "#111111",
    fontWeight: 900,
    fontSize: 17,

    "&:hover": {
      background: "#eeeeee",
    },
  },
  yellowButton: {
    height: 44,
    padding: "0 20px",
    borderRadius: 999,
    background: "#ffd84d",
    color: "#111111",
    fontWeight: 900,
    boxShadow: "0 8px 18px rgba(255, 216, 77, 0.28)",

    "&:hover": {
      background: "#ffdf68",
    },
  },
  meta: {
    color: "#888888",
    fontWeight: 800,
  },
}));

export function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: { shareId: context.params!.shareId },
  };
}

const Share = ({ shareId }: { shareId: string }) => {
  const { classes } = useStyles();
  const t = useTranslate();
  const modals = useModals();

  const [isLoading, setIsLoading] = useState(true);
  const [share, setShare] = useState<ShareType>();

  useConfirmLeave({
    message: t("upload.notify.confirm-leave"),
    enabled: isLoading,
  });

  useEffect(() => {
    shareService
      .getFromOwner(shareId)
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
            );
          } else {
            showErrorModal(
              modals,
              t("share.error.not-found.title"),
              t("share.error.not-found.description"),
            );
          }
        } else if (e.response.status == 403 && error == "share_removed") {
          showErrorModal(
            modals,
            t("share.error.access-denied.title"),
            t("share.error.access-denied.description"),
          );
        } else {
          showErrorModal(modals, t("common.error"), t("common.error.unknown"));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <LoadingOverlay visible />;

  return (
    <Box className={classes.root}>
      <Meta title={t("share.edit.title", { shareId })} />
      <Box className={classes.container}>
        <Group className={classes.toolbar} position="apart" align="center">
          <Group spacing={10}>
            <Button
              component={Link}
              href="/account/shares"
              leftIcon={<TbArrowLeft size={18} />}
              className={classes.softButton}
            >
              我的共享
            </Button>
            <Text className={classes.meta}>{share?.name || shareId}</Text>
          </Group>
          <Button
            component={Link}
            href={`/share/${shareId}`}
            rightIcon={<TbExternalLink size={18} />}
            className={classes.yellowButton}
          >
            查看分享
          </Button>
        </Group>
        <EditableUpload shareId={shareId} files={share?.files || []} />
      </Box>
    </Box>
  );
};

export default Share;
