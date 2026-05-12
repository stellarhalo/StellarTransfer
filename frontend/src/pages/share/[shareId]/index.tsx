import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import Head from "next/head";
import { useModals } from "@mantine/modals";
import {
  Box,
  Button,
  createStyles,
  Group,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import {
  TbAlertTriangle,
  TbDownload,
  TbFile,
  TbHome,
  TbLink,
} from "react-icons/tb";
import showEnterPasswordModal from "../../../components/share/showEnterPasswordModal";
import useTranslate from "../../../hooks/useTranslate.hook";
import shareService from "../../../services/share.service";
import { Share as ShareType } from "../../../types/share.type";
import toast from "../../../utils/toast.util";
import { byteToHumanSizeString } from "../../../utils/fileSize.util";
import Link from "next/link";

export function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: { shareId: context.params!.shareId },
  };
}

const useStyles = createStyles(() => ({
  root: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f7f7f7 0%, #ffffff 50%, #f0f0f0 100%)",
    paddingTop: 80,
  },
  container: {
    maxWidth: 560,
    margin: "0 auto",
    padding: "0 20px",
  },
  card: {
    border: "1px solid #eeeeee",
    borderRadius: 24,
    boxShadow: "0 12px 34px rgba(0, 0, 0, 0.06)",
    background: "#ffffff",
    overflow: "hidden",
  },
  header: {
    background: "linear-gradient(135deg, #ffd84d 0%, #ffe066 100%)",
    padding: "32px 36px",
    borderBottom: "1px solid #f0e5c8",
  },
  fileRow: {
    display: "flex",
    alignItems: "center",
    padding: "20px 28px",
    borderBottom: "1px solid #f5f5f5",
    transition: "background 140ms ease",
    "&:hover": {
      background: "#fafafa",
    },
    "&:last-child": {
      borderBottom: "none",
    },
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: "#f6f6f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
    color: "#555555",
  },
  fileName: {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: 800,
    color: "#222222",
    fontSize: 16,
  },
  fileSize: {
    color: "#999999",
    fontWeight: 700,
    marginLeft: 16,
    fontSize: 14,
  },
  downloadIcon: {
    marginLeft: 16,
    color: "#333333",
    cursor: "pointer",
    transition: "color 140ms ease",
    "&:hover": {
      color: "#ffd84d",
    },
  },
  infoSection: {
    padding: "32px 36px",
    textAlign: "center" as const,
    borderTop: "1px solid #f0f0f0",
  },
  statText: {
    color: "#888888",
    fontWeight: 700,
    fontSize: 15,
  },
  statValue: {
    color: "#111111",
    fontWeight: 900,
  },
  downloadBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    height: 58,
    borderRadius: 29,
    background: "linear-gradient(135deg, #ffd84d 0%, #ffdf68 100%)",
    color: "#5a4b16",
    fontWeight: 900,
    fontSize: 17,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(255, 216, 77, 0.35)",
    transition: "all 160ms ease",
    "&:hover": {
      background: "linear-gradient(135deg, #ffe066 0%, #ffec99 100%)",
      transform: "translateY(-2px)",
      boxShadow: "0 12px 28px rgba(255, 216, 77, 0.45)",
    },
  },
  transferText: {
    marginTop: 16,
    color: "#888888",
    fontWeight: 700,
    fontSize: 14,
    borderBottom: "2px solid #dddddd",
    display: "inline-block",
    paddingBottom: 2,
    cursor: "pointer",
    transition: "border-color 140ms ease",
    "&:hover": {
      borderColor: "#111111",
    },
  },
  divider: {
    width: "60%",
    height: 1,
    background: "#eeeeee",
    margin: "24px auto",
  },
  shareHint: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    color: "#aaaaaa",
    fontWeight: 700,
    fontSize: 14,
  },
  errorCard: {
    border: "1px solid #eeeeee",
    borderRadius: 24,
    boxShadow: "0 12px 34px rgba(0, 0, 0, 0.06)",
    background: "#ffffff",
    padding: "60px 40px",
    textAlign: "center" as const,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    background: "#fff5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    color: "#e03131",
  },
  errorTitle: {
    fontWeight: 900,
    color: "#111111",
    fontSize: 22,
    marginBottom: 12,
  },
  errorDescription: {
    color: "#777777",
    fontWeight: 700,
    fontSize: 15,
    lineHeight: 1.6,
    marginBottom: 32,
  },
  errorActions: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
  },
  backBtn: {
    height: 48,
    padding: "0 28px",
    borderRadius: 24,
    background: "#f6f6f6",
    color: "#111111",
    fontWeight: 900,
    "&:hover": {
      background: "#eeeeee",
    },
  },
  homeBtn: {
    height: 48,
    padding: "0 28px",
    borderRadius: 24,
    background: "#ffd84d",
    color: "#111111",
    fontWeight: 900,
    boxShadow: "0 8px 18px rgba(255, 216, 77, 0.3)",
    "&:hover": {
      background: "#ffdf68",
    },
  },
  loadingContainer: {
    padding: "80px 40px",
    textAlign: "center" as const,
  },
  loadingText: {
    color: "#999999",
    fontWeight: 700,
    fontSize: 15,
  },
}));

type ErrorType = "not-found" | "removed" | "access-denied" | "visitor-limit-exceeded" | null;

const Share = ({ shareId }: { shareId: string }) => {
  const [share, setShare] = useState<ShareType>();
  const [isMounted, setIsMounted] = useState(false);
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const t = useTranslate();
  const { locale } = useIntl();
  const modals = useModals();
  const { classes } = useStyles();

  const isZh = locale.startsWith("zh");

  const getShareToken = async (password?: string) => {
    await shareService
      .getShareToken(shareId, password)
      .then(() => {
        getFiles();
      })
      .catch((e) => {
        const { error } = e.response.data;
        if (error == "share_max_views_exceeded") {
          setErrorType("visitor-limit-exceeded");
          setErrorMessage(t("share.error.visitor-limit-exceeded.description"));
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
            setErrorType("removed");
            setErrorMessage(e.response.data.message || t("share.error.removed.title"));
          } else {
            setErrorType("not-found");
            setErrorMessage(t("share.error.not-found.description"));
          }
        } else if (e.response.status == 403 && error == "private_share") {
          setErrorType("access-denied");
          setErrorMessage(t("share.error.access-denied.description"));
        } else if (error == "share_password_required") {
          showEnterPasswordModal(modals, getShareToken);
        } else if (error == "share_token_required") {
          getShareToken();
        } else {
          setErrorType("not-found");
          setErrorMessage(t("common.error.unknown"));
        }
      });
  };

  useEffect(() => {
    setIsMounted(true);
    getFiles();
  }, []);

  const totalSize = share?.files?.reduce(
    (total: number, file: { size: string }) => total + parseInt(file.size),
    0,
  ) || 0;

  const expireHours = share?.expires
    ? Math.max(
        0,
        Math.floor((new Date(share.expires).getTime() - Date.now()) / (1000 * 60 * 60)),
      )
    : 168;

  const handleDownloadAll = () => {
    if (share?.files?.length === 1) {
      shareService.downloadFile(shareId, share.files[0].id);
    } else {
      shareService.downloadFile(shareId, "zip");
    }
  };

  const handleDownloadFile = (fileId: string) => {
    shareService.downloadFile(shareId, fileId);
  };

  const brandName = isZh ? "星闪包" : "StellarTransfer";
  const expireText = isZh ? "小时后过期" : " hours until expiry";
  const downloadText = isZh ? "下载文件" : "Download";
  const transferText = isZh ? "随时转存，即时下载" : "Transfer anytime, download anytime";

  const getErrorTitle = () => {
    switch (errorType) {
      case "removed":
        return t("share.error.removed.title");
      case "access-denied":
        return t("share.error.access-denied.title");
      case "visitor-limit-exceeded":
        return t("share.error.visitor-limit-exceeded.title");
      default:
        return t("share.error.not-found.title");
    }
  };

  // Error state - show elegant error page
  if (errorType) {
    return (
      <div className={classes.root}>
        <Head>
          <title>{getErrorTitle()} - {brandName}</title>
        </Head>
        <Box className={classes.container}>
          <Paper className={classes.errorCard}>
            <Box className={classes.errorIcon}>
              <TbAlertTriangle size={40} />
            </Box>
            <Title className={classes.errorTitle} order={3}>
              {getErrorTitle()}
            </Title>
            <Text className={classes.errorDescription}>
              {errorMessage}
            </Text>
            <Box className={classes.errorActions}>
              <Button
                component={Link}
                href="/"
                leftIcon={<TbHome size={18} />}
                className={classes.homeBtn}
              >
                {isZh ? "返回首页" : "Go Home"}
              </Button>
            </Box>
          </Paper>
        </Box>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <Head>
        <title>{t("share.title", { shareId: share?.name || shareId })} - {brandName}</title>
        <meta name="description" content={t("share.description")} />
      </Head>

      <Box className={classes.container}>
        <Paper className={classes.card}>
          {!isMounted ? (
            <Box className={classes.loadingContainer}>
              <Text className={classes.loadingText}>
                {isZh ? "加载中..." : "Loading..."}
              </Text>
            </Box>
          ) : (
            <>
              {share?.files?.map((file: { id: string; name: string; size: string }) => (
                <Box key={file.id} className={classes.fileRow}>
                  <Box className={classes.fileIcon}>
                    <TbFile size={24} />
                  </Box>
                  <Text className={classes.fileName} title={file.name}>
                    {file.name}
                  </Text>
                  <Text className={classes.fileSize}>
                    {byteToHumanSizeString(parseInt(file.size))}
                  </Text>
                  <Box
                    className={classes.downloadIcon}
                    onClick={() => handleDownloadFile(file.id)}
                  >
                    <TbDownload size={24} />
                  </Box>
                </Box>
              ))}

              <Box className={classes.infoSection}>
                <Group position="center" spacing="xl">
                  <Box>
                    <Text className={classes.statText}>
                      {share?.files?.length || 0} {isZh ? "个文件" : "file(s)"}
                    </Text>
                  </Box>
                  <Box>
                    <Text className={classes.statText}>
                      {byteToHumanSizeString(totalSize)}
                    </Text>
                  </Box>
                  <Box>
                    <Text className={classes.statText}>
                      {expireHours}{expireText}
                    </Text>
                  </Box>
                </Group>

                <Box mt={28}>
                  <button className={classes.downloadBtn} onClick={handleDownloadAll}>
                    <TbDownload size={22} />
                    {downloadText}
                  </button>
                </Box>

                <Text mt={20} className={classes.transferText}>
                  {transferText}
                </Text>

                <Box className={classes.divider} />

                <Box className={classes.shareHint}>
                  <TbLink size={20} />
                  <Text>{isZh ? "通过手机分享" : "Share via phone"}</Text>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </div>
  );
};

export default Share;