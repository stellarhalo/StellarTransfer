import {
  ActionIcon,
  Anchor,
  Accordion,
  Alert,
  Box,
  Button,
  Checkbox,
  Col,
  createStyles,
  Divider,
  Grid,
  Group,
  MultiSelect,
  NumberInput,
  Paper,
  PasswordInput,
  PinInput,
  Progress,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { useModals } from "@mantine/modals";
import { cleanNotifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import Head from "next/head";
import moment from "moment";
import Link from "next/link";
import pLimit from "p-limit";
import { useEffect, useRef, useState } from "react";
import {
  TbAlertCircle,
  TbArrowRight,
  TbBell,
  TbCloud,
  TbCheck,
  TbHelpCircle,
  TbHistory,
  TbLanguage,
  TbLogin,
  TbMailbox,
  TbShieldCheck,
} from "react-icons/tb";
import { FormattedMessage, useIntl } from "react-intl";
import Logo from "../../components/Logo";
import Meta from "../../components/Meta";
import Dropzone from "../../components/upload/Dropzone";
import FileList from "../../components/upload/FileList";
import showCompletedUploadModal from "../../components/upload/modals/showCompletedUploadModal";
import showCreateUploadModal from "../../components/upload/modals/showCreateUploadModal";
import useConfig from "../../hooks/config.hook";
import useConfirmLeave from "../../hooks/confirm-leave.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import useUser from "../../hooks/user.hook";
import shareService from "../../services/share.service";
import { FileUpload } from "../../types/File.type";
import { CompletedShare, CreateShare, Share } from "../../types/share.type";
import { Timespan } from "../../types/timespan.type";
import { getExpirationPreview } from "../../utils/date.util";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";
import { useRouter } from "next/router";
import * as yup from "yup";
import CopyTextField from "../../components/upload/CopyTextField";
import ActionAvatar from "../../components/header/ActionAvatar";
import i18nUtil from "../../utils/i18n.util";

const promiseLimit = pLimit(3);
let errorToastShown = false;
let createdShare: Share;

const HOME_COPY = {
  zh: {
    brandPrimary: "星闪包",
    history: "传输历史",
    cloud: "我的闪包",
    signIn: "注册/登录",
    language: "EN",
    scene: ["星", "闪", "包"],
    addFile: "添加文件",
    receiveFile: "接受文件",
    footer: "帮助与反馈 | 服务协议 | 星闪包提供支持",
    mobileFooter: "星闪包 | 添加文件或输入取件码",
    receiveTitle: "输入取件码",
    receiveHeading: "像取快递一样取文件",
    receiveDescription:
      "点击接收文件，输入分享得到的取件码，即可进入下载页面。",
    receiveSubmit: "取文件",
    receiveSecurity: "支持网页多端访问，文件由你的星闪包服务保存。",
    panelTitle: "文件传输",
    returnHome: "返回添加文件",
    copyLink: "复制链接",
    copyCodeHint: "点击拷贝 8 位取件码",
    codeCopied: "已复制该取件码",
    fileCount: "共 {count} 个文件",
    totalPrefix: "共",
    progress: "上传进度",
    startUpload: "开始上传",
    pageTitle: "上传 - 星闪包",
  },
  en: {
    brandPrimary: "StellarTransfer",
    history: "History",
    cloud: "My Flash Packs",
    signIn: "Sign in",
    language: "中",
    scene: ["STAR", "TRANS", "FER"],
    addFile: "Add File",
    receiveFile: "Receive File",
    footer: "Help & Feedback | Terms | Powered by StellarTransfer",
    mobileFooter: "StellarTransfer | Add files or enter pickup code",
    receiveTitle: "Enter Pickup Code",
    receiveHeading: "Pick up files like a delivery",
    receiveDescription:
      "Click Receive File, enter the pickup code, and open the download page.",
    receiveSubmit: "Get Files",
    receiveSecurity:
      "Works across web devices. Files are stored by your StellarTransfer service.",
    panelTitle: "File Transfer",
    returnHome: "Back to Add File",
    copyLink: "Copy Link",
    copyCodeHint: "Click to copy the 8-character pickup code",
    codeCopied: "Pickup code copied",
    fileCount: "{count} files",
    totalPrefix: "Total",
    progress: "Upload Progress",
    startUpload: "Start Upload",
    pageTitle: "Upload - StellarTransfer",
  },
};

type HomeCopy = (typeof HOME_COPY)["zh"];

const generateShareId = (length: number = 16) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomArray = new Uint8Array(length >= 3 ? length : 3);
  crypto.getRandomValues(randomArray);
  randomArray.forEach((number) => {
    result += chars[number % chars.length];
  });
  return result;
};

const useStyles = createStyles((theme) => ({
  page: {
    position: "relative",
    height: "100vh",
    minHeight: 640,
    overflow: "hidden",
    background: "#111417",
    color: "#101318",
  },

  background: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, rgba(16, 18, 20, 0.84) 0 18%, transparent 18% 100%), linear-gradient(118deg, #1d91a6 0 12%, #8dd4cf 12% 19%, #d8d0e9 19% 32%, #fff0b0 32% 46%, #75bad5 46% 68%, #73d4e9 68% 100%)",

    "&::before": {
      content: "''",
      position: "absolute",
      inset: "0 0 -12% 0",
      background:
        "polygon(0 64%, 16% 47%, 24% 92%, 54% 46%, 56% 100%, 100% 100%, 100% 83%, 55% 52%, 24% 100%, 17% 48%, 0 58%)",
      clipPath:
        "polygon(0 64%, 16% 47%, 24% 92%, 54% 46%, 56% 100%, 100% 100%, 100% 83%, 55% 52%, 24% 100%, 17% 48%, 0 58%)",
      backgroundColor: "#2b9bbd",
      opacity: 0.82,
    },

    "&::after": {
      content: "''",
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(66deg, transparent 0 22%, rgba(46, 63, 72, 0.46) 22% 30%, transparent 30% 100%), linear-gradient(62deg, transparent 0 43%, #0b5360 43% 55%, transparent 55% 100%), linear-gradient(25deg, transparent 0 72%, rgba(247, 239, 199, 0.72) 72% 100%)",
      mixBlendMode: "multiply",
      opacity: 0.82,
    },
  },

  shade: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 76% 12%, rgba(255,255,255,0.2), transparent 25%), linear-gradient(90deg, rgba(10, 10, 10, 0.18), transparent 45%), linear-gradient(0deg, rgba(0,0,0,0.24), transparent 32%)",
  },

  proTab: {
    position: "absolute",
    left: 0,
    top: "18%",
    zIndex: 11,
    width: 72,
    height: 118,
    borderRadius: "0 999px 999px 0",
    background: "#ffd85f",
    color: "#17191d",
    display: "grid",
    placeItems: "center",
    fontSize: 14,
    fontWeight: 900,
    writingMode: "vertical-rl",
    boxShadow: "0 16px 34px rgba(0,0,0,0.18)",

    [theme.fn.smallerThan("md")]: {
      display: "none",
    },
  },

  brand: {
    position: "absolute",
    top: 28,
    left: 34,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    gap: 12,
    color: "#ffffff",
    textShadow: "0 2px 10px rgba(0,0,0,0.2)",

    [theme.fn.smallerThan("xs")]: {
      top: 18,
      left: 18,
    },
  },

  brandText: {
    fontSize: 20,
    lineHeight: 1.05,
    fontWeight: 900,
  },

  nav: {
    position: "absolute",
    top: 28,
    right: 32,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    height: 52,
    gap: 6,
    padding: "8px 10px",
    borderRadius: 8,
    background: "rgba(255, 255, 255, 0.94)",
    boxShadow: "0 10px 30px rgba(21, 34, 48, 0.16)",

    [theme.fn.smallerThan("sm")]: {
      right: 16,
      maxWidth: "calc(100vw - 32px)",
    },
  },

  navLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 36,
    minWidth: 72,
    padding: "0 12px",
    borderRadius: 6,
    color: "#15171b",
    fontSize: 14,
    fontWeight: 800,
    whiteSpace: "nowrap",

    "&:hover": {
      background: "#f2f2f2",
      textDecoration: "none",
    },

    [theme.fn.smallerThan("xs")]: {
      padding: "0 9px",
      fontSize: 13,
    },
  },

  optionalNavLink: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  navIcon: {
    width: 36,
    height: 36,
    color: "#17191d",
    background: "#f5f5f5",

    "&:hover": {
      background: "#ececec",
    },

    [theme.fn.smallerThan("xs")]: {
      display: "none",
    },
  },

  navAvatar: {
    width: 36,
    height: 36,
    display: "grid",
    placeItems: "center",
    borderRadius: 6,
    background: "#f5f5f5",

    "&:hover": {
      background: "#ececec",
    },
  },

  uploadPanel: {
    position: "absolute",
    left: "clamp(112px, 8vw, 166px)",
    top: "52%",
    zIndex: 8,
    transform: "translateY(-50%)",
    animation: "homePanelIn 260ms cubic-bezier(.2,.8,.2,1) both",

    [theme.fn.smallerThan("sm")]: {
      left: 16,
      top: "50%",
    },
  },

  uploadHint: {
    position: "absolute",
    left: 12,
    top: "calc(100% + 18px)",
    width: "min(468px, calc(100vw - 32px))",
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: 700,
    textShadow: "0 2px 10px rgba(0,0,0,0.18)",
  },

  filePanel: {
    position: "absolute",
    zIndex: 9,
    left: "clamp(112px, 8vw, 166px)",
    top: "calc(52% + 146px)",
    width: "min(520px, calc(100vw - 40px))",
    maxHeight: "34vh",
    overflow: "auto",
    padding: 16,
    borderRadius: 18,
    background: "rgba(255,255,255,0.94)",
    boxShadow: "0 18px 50px rgba(21,34,48,0.2)",

    [theme.fn.smallerThan("sm")]: {
      left: 16,
      top: "calc(50% + 142px)",
    },
  },

  uploadFormPanel: {
    position: "absolute",
    left: "clamp(112px, 8vw, 166px)",
    top: "52%",
    zIndex: 9,
    width: "min(500px, calc(100vw - 40px))",
    maxHeight: "calc(100vh - 92px)",
    overflow: "auto",
    transform: "translateY(-50%)",
    padding: 24,
    borderRadius: 8,
    background: "rgba(255,255,255,0.98)",
    boxShadow: "0 28px 80px rgba(18, 27, 38, 0.26)",
    animation: "uploadPanelIn 280ms cubic-bezier(.2,.8,.2,1) both",

    [theme.fn.smallerThan("sm")]: {
      left: 16,
      right: 16,
      top: 96,
      width: "auto",
      maxHeight: "calc(100vh - 132px)",
      transform: "none",
      padding: 18,
      animation: "mobileUploadPanelIn 260ms cubic-bezier(.2,.8,.2,1) both",
    },
  },

  uploadFormPanelReturning: {
    animation: "uploadPanelOut 220ms cubic-bezier(.4,0,.2,1) both",

    [theme.fn.smallerThan("sm")]: {
      animation: "mobileUploadPanelOut 220ms cubic-bezier(.4,0,.2,1) both",
    },
  },

  completedReturnButton: {
    position: "relative",
    width: 118,
    height: 118,
    border: 0,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "#ffdc5a",
    color: "#171717",
    fontSize: 62,
    boxShadow: "0 18px 42px rgba(226, 179, 20, 0.28)",
    cursor: "pointer",
    transition:
      "transform 180ms ease, box-shadow 180ms ease, background 180ms ease",

    "&::after": {
      content: "''",
      position: "absolute",
      inset: -8,
      borderRadius: "50%",
      border: "2px solid rgba(255, 216, 77, 0.42)",
      opacity: 0,
      transform: "scale(0.92)",
      transition: "opacity 180ms ease, transform 180ms ease",
    },

    "&:hover": {
      transform: "translateY(-3px) scale(1.04)",
      background: "#ffe16b",
      boxShadow: "0 24px 54px rgba(226, 179, 20, 0.36)",
    },

    "&:hover::after": {
      opacity: 1,
      transform: "scale(1)",
    },

    "&:active": {
      transform: "translateY(0) scale(0.98)",
    },
  },

  panelFileList: {
    minHeight: 210,
    maxHeight: 280,
    overflow: "auto",
    borderRadius: 6,
    background: "#f7f7f7",
  },

  yellowAction: {
    height: 58,
    borderRadius: 999,
    background: "#ffdc5a",
    color: "#171717",
    fontSize: 18,
    fontWeight: 900,

    "&:hover": {
      background: "#f4ce42",
    },
  },

  completeCode: {
    width: 42,
    height: 42,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "#fff0a8",
    color: "#171717",
    fontSize: 18,
    fontWeight: 900,
    cursor: "pointer",
  },

  sceneCard: {
    position: "absolute",
    right: "7vw",
    top: "50%",
    zIndex: 5,
    width: "min(760px, 44vw)",
    aspectRatio: "1.65 / 1",
    transform: "translateY(-50%)",
    borderRadius: 6,
    overflow: "hidden",
    background: "linear-gradient(180deg, #34bfae 0 62%, #259986 62% 100%)",
    boxShadow: "0 28px 80px rgba(0,0,0,0.28)",

    [theme.fn.smallerThan("lg")]: {
      opacity: 0.48,
      right: "-18vw",
      width: "70vw",
    },

    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  sceneLogo: {
    position: "absolute",
    top: 24,
    left: 24,
    color: "#fff",
    fontSize: 17,
    lineHeight: 1.04,
    fontWeight: 900,
    letterSpacing: 9,
  },

  legs: {
    position: "absolute",
    inset: "0 8% 18% 12%",
    background:
      "linear-gradient(90deg, transparent 0 4%, #143f43 4% 18%, transparent 18% 24%, #123b3f 24% 37%, transparent 37% 45%, #f5ddad 45% 58%, transparent 58% 64%, #b7d9e5 64% 75%, transparent 75% 82%, #163f71 82% 96%, transparent 96% 100%)",
    filter: "drop-shadow(0 16px 0 rgba(38,58,68,0.22))",
  },

  shoes: {
    position: "absolute",
    left: "17%",
    right: "8%",
    bottom: "13%",
    height: "18%",
    background:
      "radial-gradient(ellipse at 5% 60%, #dfe9ee 0 8%, transparent 9%), radial-gradient(ellipse at 23% 62%, #dfe9ee 0 9%, transparent 10%), radial-gradient(ellipse at 45% 68%, #f6fbff 0 9%, transparent 10%), radial-gradient(ellipse at 68% 70%, #b95f46 0 9%, transparent 10%), radial-gradient(ellipse at 91% 68%, #7d4a35 0 11%, transparent 12%)",
  },

  receiveTip: {
    position: "absolute",
    right: 34,
    bottom: 34,
    zIndex: 8,
    width: 286,
    padding: 18,
    borderRadius: 8,
    background: "rgba(255,255,255,0.94)",
    boxShadow: "0 16px 46px rgba(0,0,0,0.2)",

    [theme.fn.smallerThan("md")]: {
      display: "none",
    },
  },

  tipButton: {
    height: 48,
    minWidth: 180,
    borderRadius: 999,
    fontSize: 15,
    fontWeight: 800,
  },

  shareAction: {
    position: "absolute",
    right: 24,
    bottom: 24,
    zIndex: 10,
    borderRadius: 999,
    height: 46,
    minWidth: 118,
    paddingLeft: 24,
    paddingRight: 24,
    background: "#0b0d10",

    "&:hover": {
      background: "#22252a",
    },
  },

  footer: {
    position: "absolute",
    left: 34,
    bottom: 18,
    zIndex: 4,
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: 700,

    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  mobileFooter: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 18,
    zIndex: 4,
    display: "none",
    color: "rgba(255,255,255,0.74)",
    fontSize: 11,

    [theme.fn.smallerThan("sm")]: {
      display: "block",
    },
  },

  "@keyframes uploadPanelIn": {
    "0%": {
      opacity: 0,
      transform: "translateY(calc(-50% + 18px)) scale(0.96)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(-50%) scale(1)",
    },
  },

  "@keyframes uploadPanelOut": {
    "0%": {
      opacity: 1,
      transform: "translateY(-50%) scale(1)",
    },
    "100%": {
      opacity: 0,
      transform: "translateY(calc(-50% + 18px)) scale(0.94)",
    },
  },

  "@keyframes homePanelIn": {
    "0%": {
      opacity: 0,
      transform: "translateY(calc(-50% + 14px)) scale(0.94)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(-50%) scale(1)",
    },
  },

  "@keyframes mobileUploadPanelIn": {
    "0%": {
      opacity: 0,
      transform: "translateY(16px) scale(0.96)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(0) scale(1)",
    },
  },

  "@keyframes mobileUploadPanelOut": {
    "0%": {
      opacity: 1,
      transform: "translateY(0) scale(1)",
    },
    "100%": {
      opacity: 0,
      transform: "translateY(16px) scale(0.94)",
    },
  },
}));

const Upload = ({
  maxShareSize,
  isReverseShare = false,
  simplified,
}: {
  maxShareSize?: number;
  isReverseShare: boolean;
  simplified: boolean;
}) => {
  const { classes, cx } = useStyles();
  const modals = useModals();
  const router = useRouter();
  const t = useTranslate();
  const { locale } = useIntl();

  const { user } = useUser();
  const config = useConfig();
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isUploading, setisUploading] = useState(false);
  const [completedShare, setCompletedShare] = useState<CompletedShare>();
  const language = locale === "en-US" ? "en-US" : "zh-CN";
  const homeText = language === "en-US" ? HOME_COPY.en : HOME_COPY.zh;

  const toggleLanguage = () => {
    const nextLanguage = language === "en-US" ? "zh-CN" : "en-US";
    i18nUtil.setLanguageCookie(nextLanguage);
    location.reload();
  };

  useConfirmLeave({
    message: t("upload.notify.confirm-leave"),
    enabled: isUploading,
  });

  const chunkSize = useRef(parseInt(config.get("share.chunkSize")));

  maxShareSize ??= parseInt(config.get("share.maxSize"));
  if (!isReverseShare) maxShareSize = 0;
  const autoOpenCreateUploadModal = config.get("share.autoOpenShareModal");

  const uploadFiles = async (share: CreateShare, files: FileUpload[]) => {
    setisUploading(true);

    try {
      const isReverseShare = router.pathname != "/upload";
      createdShare = await shareService.create(share, isReverseShare);
    } catch (e) {
      toast.axiosError(e);
      setisUploading(false);
      return;
    }

    const fileUploadPromises = files.map(async (file, fileIndex) =>
      // Limit the number of concurrent uploads to 3
      promiseLimit(async () => {
        let fileId;

        const setFileProgress = (progress: number) => {
          setFiles((files) =>
            files.map((file, callbackIndex) => {
              if (fileIndex == callbackIndex) {
                file.uploadingProgress = progress;
              }
              return file;
            }),
          );
        };

        setFileProgress(1);

        let chunks = Math.ceil(file.size / chunkSize.current);

        // If the file is 0 bytes, we still need to upload 1 chunk
        if (chunks == 0) chunks++;

        for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex++) {
          const from = chunkIndex * chunkSize.current;
          const to = from + chunkSize.current;
          const blob = file.slice(from, to);
          try {
            await shareService
              .uploadFile(
                createdShare.id,
                blob,
                {
                  id: fileId,
                  name: file.name,
                },
                chunkIndex,
                chunks,
              )
              .then((response) => {
                fileId = response.id;
              });

            setFileProgress(((chunkIndex + 1) / chunks) * 100);
          } catch (e) {
            if (
              e instanceof AxiosError &&
              e.response?.data.error == "unexpected_chunk_index"
            ) {
              // Retry with the expected chunk index
              chunkIndex = e.response!.data!.expectedChunkIndex - 1;
              continue;
            } else {
              setFileProgress(-1);
              // Retry after 5 seconds
              await new Promise((resolve) => setTimeout(resolve, 5000));
              chunkIndex = -1;

              continue;
            }
          }
        }
      }),
    );

    Promise.all(fileUploadPromises);
  };

  const showCreateUploadModalCallback = (files: FileUpload[]) => {
    showCreateUploadModal(
      modals,
      {
        isUserSignedIn: user ? true : false,
        isReverseShare,
        allowUnauthenticatedShares: config.get(
          "share.allowUnauthenticatedShares",
        ),
        enableEmailRecepients: config.get("email.enableShareEmailRecipients"),
        maxExpiration: config.get("share.maxExpiration"),
        shareIdLength: config.get("share.shareIdLength"),
        simplified,
      },
      files,
      uploadFiles,
    );
  };

  const handleDropzoneFilesChanged = (files: FileUpload[]) => {
    setCompletedShare(undefined);
    if (isReverseShare && autoOpenCreateUploadModal) {
      setFiles(files);
      showCreateUploadModalCallback(files);
    } else {
      setFiles((oldArr) => [...oldArr, ...files]);
    }
  };

  const showReceiveModal = () => {
    modals.openModal({
      title: homeText.receiveTitle,
      centered: true,
      radius: "md",
      size: 520,
      children: (
        <ReceiveCodeForm
          labels={homeText}
          onSubmit={(code) => router.push(`/share/${code}`)}
        />
      ),
    });
  };

  useEffect(() => {
    // Check if there are any files that failed to upload
    const fileErrorCount = files.filter(
      (file) => file.uploadingProgress == -1,
    ).length;

    if (fileErrorCount > 0) {
      if (!errorToastShown) {
        toast.error(
          t("upload.notify.count-failed", { count: fileErrorCount }),
          {
            withCloseButton: false,
            autoClose: false,
          },
        );
      }
      errorToastShown = true;
    } else {
      cleanNotifications();
      errorToastShown = false;
    }

    // Complete share
    if (
      files.length > 0 &&
      files.every((file) => file.uploadingProgress >= 100) &&
      fileErrorCount == 0
    ) {
      shareService
        .completeShare(createdShare.id)
        .then((share) => {
          setisUploading(false);
          if (isReverseShare) {
            showCompletedUploadModal(modals, share);
            setFiles([]);
          } else {
            setCompletedShare(share);
          }
        })
        .catch(() => toast.error(t("upload.notify.generic-error")));
    }
  }, [files]);

  const shareButton = (
    <Button
      loading={isUploading}
      disabled={files.length <= 0}
      onClick={() => showCreateUploadModalCallback(files)}
      className={!isReverseShare ? classes.shareAction : undefined}
    >
      <FormattedMessage id="common.button.share" />
    </Button>
  );

  if (!isReverseShare) {
    return (
      <Box className={classes.page}>
        <Meta title={t("upload.title")} />
        <Head>
          <title>{homeText.pageTitle}</title>
          <meta name="og:title" content={homeText.pageTitle} />
          <meta name="twitter:title" content={homeText.pageTitle} />
        </Head>
        <div className={classes.background} />
        <div className={classes.shade} />

        <Link href="/" className={classes.brand}>
          <Logo height={42} width={42} />
          <Text className={classes.brandText}>{homeText.brandPrimary}</Text>
        </Link>

        <nav className={classes.nav} aria-label="Primary">
          <Anchor
            component={Link}
            href="/account/shares"
            className={cx(classes.navLink, classes.optionalNavLink)}
          >
            <TbHistory size={17} />
            {homeText.history}
          </Anchor>
          <Anchor
            component={Link}
            href="/account/reverseShares"
            className={cx(classes.navLink, classes.optionalNavLink)}
          >
            <TbCloud size={17} />
            {homeText.cloud}
          </Anchor>
          <ActionIcon className={classes.navIcon} radius="xl" size={34}>
            <TbHelpCircle size={19} />
          </ActionIcon>
          <ActionIcon className={classes.navIcon} radius="xl" size={34}>
            <TbBell size={18} />
          </ActionIcon>
          {user ? (
            <Box className={classes.navAvatar}>
              <ActionAvatar />
            </Box>
          ) : (
            <Anchor
              component={Link}
              href="/auth/signIn"
              className={classes.navLink}
            >
              <TbLogin size={17} />
              {homeText.signIn}
            </Anchor>
          )}
          <Anchor
            component="button"
            type="button"
            className={classes.navLink}
            onClick={toggleLanguage}
          >
            <TbLanguage size={18} />
            {homeText.language}
          </Anchor>
        </nav>

        <div className={classes.sceneCard} aria-hidden="true">
          <div className={classes.sceneLogo}>
            {homeText.scene[0]}
            <br />
            {homeText.scene[1]}
            <br />
            {homeText.scene[2]}
          </div>
          <div className={classes.legs} />
          <div className={classes.shoes} />
        </div>

        {files.length > 0 || completedShare ? (
          <HomepageUploadPanel
            files={files}
            setFiles={setFiles}
            isUploading={isUploading}
            completedShare={completedShare}
            maxShareSize={maxShareSize}
            options={{
              isUserSignedIn: user ? true : false,
              isReverseShare,
              allowUnauthenticatedShares: config.get(
                "share.allowUnauthenticatedShares",
              ),
              enableEmailRecepients: config.get(
                "email.enableShareEmailRecipients",
              ),
              maxExpiration: config.get("share.maxExpiration"),
              shareIdLength: config.get("share.shareIdLength"),
            }}
            labels={homeText}
            onStartUpload={uploadFiles}
            onReturnHome={() => {
              setFiles([]);
              setCompletedShare(undefined);
            }}
          />
        ) : (
          <div className={classes.uploadPanel}>
            <Dropzone
              title={homeText.addFile}
              receiveLabel={homeText.receiveFile}
              maxShareSize={maxShareSize}
              onFilesChanged={handleDropzoneFilesChanged}
              isUploading={isUploading}
              onReceive={showReceiveModal}
              variant="stellarTransfer"
            />
          </div>
        )}
        <Text className={classes.footer}>{homeText.footer}</Text>
        <Text className={classes.mobileFooter}>{homeText.mobileFooter}</Text>
      </Box>
    );
  }

  return (
    <>
      <Meta title={t("upload.title")} />
      <Group position="right" mb={20}>
        {shareButton}
      </Group>
      <Dropzone
        title={
          !autoOpenCreateUploadModal && files.length > 0
            ? t("share.edit.append-upload")
            : undefined
        }
        maxShareSize={maxShareSize}
        onFilesChanged={handleDropzoneFilesChanged}
        isUploading={isUploading}
      />
      {files.length > 0 && (
        <FileList<FileUpload> files={files} setFiles={setFiles} />
      )}
    </>
  );
};

type ReceiveCodeFormProps = {
  labels: HomeCopy;
  // eslint-disable-next-line no-unused-vars
  onSubmit(code: string): void;
};

type HomepageUploadPanelProps = {
  files: FileUpload[];
  // eslint-disable-next-line no-unused-vars
  setFiles: (files: FileUpload[]) => void;
  isUploading: boolean;
  completedShare?: CompletedShare;
  maxShareSize: number;
  options: {
    isUserSignedIn: boolean;
    isReverseShare: boolean;
    allowUnauthenticatedShares: boolean;
    enableEmailRecepients: boolean;
    maxExpiration: Timespan;
    shareIdLength: number;
  };
  labels: HomeCopy;
  // eslint-disable-next-line no-unused-vars
  onStartUpload(createShare: CreateShare, files: FileUpload[]): void;
  onReturnHome(): void;
};

const HomepageUploadPanel = ({
  files,
  setFiles,
  isUploading,
  completedShare,
  maxShareSize,
  options,
  labels,
  onStartUpload,
  onReturnHome,
}: HomepageUploadPanelProps) => {
  const { classes, cx } = useStyles();
  const t = useTranslate();
  const [showNotSignedInAlert, setShowNotSignedInAlert] = useState(true);
  const [isReturningHome, setIsReturningHome] = useState(false);
  const generatedLink = useRef(generateShareId(options.shareIdLength));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validationSchema = yup.object().shape({
    link: yup
      .string()
      .required(t("common.error.field-required"))
      .min(3, t("common.error.too-short", { length: 3 }))
      .max(50, t("common.error.too-long", { length: 50 }))
      .matches(new RegExp("^[a-zA-Z0-9_-]*$"), {
        message: t("upload.modal.link.error.invalid"),
      }),
    name: yup
      .string()
      .transform((value) => value || undefined)
      .min(3, t("common.error.too-short", { length: 3 }))
      .max(30, t("common.error.too-long", { length: 30 })),
    password: yup
      .string()
      .transform((value) => value || undefined)
      .min(3, t("common.error.too-short", { length: 3 }))
      .max(30, t("common.error.too-long", { length: 30 })),
    maxViews: yup
      .number()
      .transform((value) => value || undefined)
      .min(1),
  });

  const form = useForm<{
    name?: string;
    link: string;
    recipients: string[];
    password?: string;
    maxViews?: number;
    description?: string;
    expiration_num: number;
    expiration_unit: string;
    never_expires: boolean;
  }>({
    initialValues: {
      name: undefined,
      link: generatedLink.current,
      recipients: [],
      password: undefined,
      maxViews: undefined,
      description: undefined,
      expiration_num: 7,
      expiration_unit: "-days",
      never_expires: false,
    },
    validate: yupResolver(validationSchema),
  });

  const progress =
    files.length > 0
      ? Math.round(
          files.reduce(
            (total, file) =>
              total + Math.max(0, Math.min(file.uploadingProgress, 100)),
            0,
          ) / files.length,
        )
      : 0;

  const onSubmit = form.onSubmit(async (values) => {
    const isShareIdAvailable = await shareService
      .isShareIdAvailable(values.link)
      .catch((error) => {
        toast.axiosError(error);
        return undefined;
      });

    if (isShareIdAvailable == undefined) return;

    if (!isShareIdAvailable) {
      form.setFieldError("link", t("upload.modal.link.error.taken"));
      return;
    }

    const expirationString = form.values.never_expires
      ? "never"
      : form.values.expiration_num + form.values.expiration_unit;

    const expirationDate = moment().add(
      form.values.expiration_num,
      form.values.expiration_unit.replace(
        "-",
        "",
      ) as moment.unitOfTime.DurationConstructor,
    );

    if (
      options.maxExpiration.value != 0 &&
      (form.values.never_expires ||
        expirationDate.isAfter(
          moment().add(options.maxExpiration.value, options.maxExpiration.unit),
        ))
    ) {
      form.setFieldError(
        "expiration_num",
        t("upload.modal.expires.error.too-long", {
          max: moment
            .duration(options.maxExpiration.value, options.maxExpiration.unit)
            .humanize(),
        }),
      );
      return;
    }

    onStartUpload(
      {
        id: values.link,
        name: values.name,
        expiration: expirationString,
        recipients: values.recipients,
        description: values.description,
        security: {
          password: values.password || undefined,
          maxViews: values.maxViews || undefined,
        },
      },
      files,
    );
  });

  if (completedShare) {
    const link = `${window.location.origin}/s/${completedShare.id}`;
    const pickupCode = completedShare.id.slice(0, 8);
    const codeParts = completedShare.id
      .slice(0, 8)
      .toUpperCase()
      .padEnd(8, "0")
      .split("");

    const returnHome = () => {
      if (isReturningHome) return;
      setIsReturningHome(true);
      window.setTimeout(onReturnHome, 220);
    };

    return (
      <Paper
        className={cx(
          classes.uploadFormPanel,
          isReturningHome && classes.uploadFormPanelReturning,
        )}
      >
        <Stack align="stretch" spacing={24}>
          <Stack align="center" spacing={4}>
            <Box
              component="button"
              type="button"
              aria-label={labels.returnHome}
              title={labels.returnHome}
              className={classes.completedReturnButton}
              onClick={returnHome}
            >
              <TbCheck />
            </Box>
          </Stack>
          <Text size="sm" align="center" color="dimmed" weight={700}>
            {moment(completedShare.expiration).unix() === 0
              ? t("upload.modal.completed.never-expires")
              : t("upload.modal.completed.expires-on", {
                  expiration: moment(completedShare.expiration).format("LLL"),
                })}
          </Text>
          <CopyTextField link={link} />
          <Button
            className={classes.yellowAction}
            onClick={() => navigator.clipboard.writeText(link)}
          >
            {labels.copyLink}
          </Button>
          <Divider />
          <Text size="sm" color="dimmed" weight={700}>
            {labels.copyCodeHint}
          </Text>
          <Group
            spacing={8}
            noWrap
            onClick={() => {
              navigator.clipboard.writeText(pickupCode);
              toast.success(labels.codeCopied);
            }}
          >
            {codeParts.map((part, index) => (
              <Box className={classes.completeCode} key={`${part}-${index}`}>
                {part}
              </Box>
            ))}
          </Group>
          <Divider />
          <Text size="sm" color="dimmed" weight={700}>
            {labels.fileCount.replace("{count}", files.length.toString())}
          </Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper className={classes.uploadFormPanel}>
      <form onSubmit={onSubmit}>
        <Stack align="stretch" spacing={18}>
          {showNotSignedInAlert && !options.isUserSignedIn && (
            <Alert
              withCloseButton
              onClose={() => setShowNotSignedInAlert(false)}
              icon={<TbAlertCircle size={16} />}
              title={t("upload.modal.not-signed-in")}
              color="yellow"
            >
              <FormattedMessage id="upload.modal.not-signed-in-description" />
            </Alert>
          )}
          <Group position="apart" align="center" noWrap>
            <Group spacing={10} noWrap>
              <Title order={2} sx={{ lineHeight: 1 }}>
                {labels.panelTitle}
              </Title>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={(event) => {
                  const selectedFiles = Array.from(
                    event.currentTarget.files || [],
                  ) as FileUpload[];
                  const fileSizeSum = selectedFiles.reduce(
                    (total, file) => total + file.size,
                    0,
                  );

                  if (maxShareSize > 0 && fileSizeSum > maxShareSize) {
                    toast.error(
                      t("upload.dropzone.notify.file-too-big", {
                        maxSize: byteToHumanSizeString(maxShareSize),
                      }),
                    );
                  } else {
                    setFiles([
                      ...files,
                      ...selectedFiles.map((file) => {
                        file.uploadingProgress = 0;
                        return file;
                      }),
                    ]);
                  }

                  event.currentTarget.value = "";
                }}
              />
              <ActionIcon
                size={42}
                radius="xl"
                sx={{ background: "#ffdc5a", color: "#171717" }}
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                +
              </ActionIcon>
            </Group>
            <Text color="dimmed" weight={800}>
              {labels.totalPrefix}{" "}
              {files.reduce((total, file) => total + file.size, 0) > 0
                ? byteToHumanSizeString(
                    files.reduce((total, file) => total + file.size, 0),
                  )
                : "0 B"}
            </Text>
          </Group>
          <div className={classes.panelFileList}>
            <FileList<FileUpload> files={files} setFiles={setFiles} />
          </div>
          {(isUploading || progress > 0) && (
            <Stack spacing={6}>
              <Group position="apart">
                <Text size="sm" weight={800}>
                  {labels.progress}
                </Text>
                <Text size="sm" weight={900}>
                  {progress}%
                </Text>
              </Group>
              <Progress value={progress} color="yellow" radius="xl" size="lg" />
            </Stack>
          )}
          <Group align={form.errors.link ? "center" : "flex-end"}>
            <TextInput
              style={{ flex: 1 }}
              variant="filled"
              label={t("upload.modal.link.label")}
              placeholder="myAwesomeShare"
              disabled={isUploading}
              {...form.getInputProps("link")}
            />
            <Button
              variant="outline"
              disabled={isUploading}
              onClick={() =>
                form.setFieldValue(
                  "link",
                  generateShareId(options.shareIdLength),
                )
              }
            >
              <FormattedMessage id="common.button.generate" />
            </Button>
          </Group>
          <Text truncate italic size="xs" color="dimmed">
            {`${window.location.origin}/s/${form.values.link}`}
          </Text>
          <Grid align={form.errors.expiration_num ? "center" : "flex-end"}>
            <Col xs={6}>
              <NumberInput
                min={1}
                max={99999}
                precision={0}
                variant="filled"
                label={t("upload.modal.expires.label")}
                disabled={isUploading || form.values.never_expires}
                {...form.getInputProps("expiration_num")}
              />
            </Col>
            <Col xs={6}>
              <Select
                disabled={isUploading || form.values.never_expires}
                {...form.getInputProps("expiration_unit")}
                data={[
                  {
                    value: "-minutes",
                    label: t("upload.modal.expires.minute-plural"),
                  },
                  {
                    value: "-hours",
                    label: t("upload.modal.expires.hour-plural"),
                  },
                  {
                    value: "-days",
                    label: t("upload.modal.expires.day-plural"),
                  },
                  {
                    value: "-weeks",
                    label: t("upload.modal.expires.week-plural"),
                  },
                  {
                    value: "-months",
                    label: t("upload.modal.expires.month-plural"),
                  },
                  {
                    value: "-years",
                    label: t("upload.modal.expires.year-plural"),
                  },
                ]}
              />
            </Col>
          </Grid>
          {options.maxExpiration.value == 0 && (
            <Checkbox
              label={t("upload.modal.expires.never-long")}
              disabled={isUploading}
              {...form.getInputProps("never_expires")}
            />
          )}
          <Text italic size="xs" color="dimmed">
            {getExpirationPreview(
              {
                neverExpires: t("upload.modal.completed.never-expires"),
                expiresOn: t("upload.modal.completed.expires-on"),
              },
              form,
            )}
          </Text>
          <Accordion>
            <Accordion.Item value="description" sx={{ borderBottom: "none" }}>
              <Accordion.Control>
                <FormattedMessage id="upload.modal.accordion.name-and-description.title" />
              </Accordion.Control>
              <Accordion.Panel>
                <Stack align="stretch">
                  <TextInput
                    variant="filled"
                    disabled={isUploading}
                    placeholder={t(
                      "upload.modal.accordion.name-and-description.name.placeholder",
                    )}
                    {...form.getInputProps("name")}
                  />
                  <Textarea
                    variant="filled"
                    disabled={isUploading}
                    placeholder={t(
                      "upload.modal.accordion.name-and-description.description.placeholder",
                    )}
                    {...form.getInputProps("description")}
                  />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
            {options.enableEmailRecepients && (
              <Accordion.Item value="recipients" sx={{ borderBottom: "none" }}>
                <Accordion.Control>
                  <FormattedMessage id="upload.modal.accordion.email.title" />
                </Accordion.Control>
                <Accordion.Panel>
                  <MultiSelect
                    data={form.values.recipients}
                    disabled={isUploading}
                    placeholder={t("upload.modal.accordion.email.placeholder")}
                    searchable
                    creatable
                    inputMode="email"
                    getCreateLabel={(query) => `+ ${query}`}
                    onCreate={(query) => {
                      if (!query.match(/^\S+@\S+\.\S+$/)) {
                        form.setFieldError(
                          "recipients",
                          t("upload.modal.accordion.email.invalid-email"),
                        );
                      } else {
                        form.setFieldError("recipients", null);
                        form.setFieldValue("recipients", [
                          ...form.values.recipients,
                          query,
                        ]);
                        return query;
                      }
                    }}
                    {...form.getInputProps("recipients")}
                  />
                </Accordion.Panel>
              </Accordion.Item>
            )}
            <Accordion.Item value="security" sx={{ borderBottom: "none" }}>
              <Accordion.Control>
                <FormattedMessage id="upload.modal.accordion.security.title" />
              </Accordion.Control>
              <Accordion.Panel>
                <Stack align="stretch">
                  <PasswordInput
                    variant="filled"
                    disabled={isUploading}
                    placeholder={t(
                      "upload.modal.accordion.security.password.placeholder",
                    )}
                    label={t("upload.modal.accordion.security.password.label")}
                    autoComplete="new-password"
                    {...form.getInputProps("password")}
                  />
                  <NumberInput
                    min={1}
                    type="number"
                    variant="filled"
                    disabled={isUploading}
                    placeholder={t(
                      "upload.modal.accordion.security.max-views.placeholder",
                    )}
                    label={t("upload.modal.accordion.security.max-views.label")}
                    {...form.getInputProps("maxViews")}
                  />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
          <Button
            type="submit"
            className={classes.yellowAction}
            loading={isUploading}
            disabled={files.length <= 0}
          >
            {labels.startUpload}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

const ReceiveCodeForm = ({ labels, onSubmit }: ReceiveCodeFormProps) => {
  const [code, setCode] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const normalizedCode = code.trim();
        if (normalizedCode) onSubmit(normalizedCode);
      }}
    >
      <Stack
        spacing={26}
        sx={{
          minHeight: 360,
          padding: "10px 0 18px",
        }}
      >
        <Group spacing="sm">
          <TbMailbox size={22} />
          <Text weight={900}>{labels.receiveHeading}</Text>
        </Group>
        <Text color="dimmed" size="sm">
          {labels.receiveDescription}
        </Text>
        <PinInput
          autoFocus
          length={8}
          size="lg"
          radius="md"
          value={code}
          onChange={setCode}
          sx={{
            justifyContent: "space-between",
            gap: 8,

            input: {
              width: 50,
              height: 64,
              border: 0,
              background: "#fff0a8",
              color: "#171717",
              fontSize: 24,
              fontWeight: 900,
              textTransform: "none",
              WebkitTextSecurity: "none",
              textSecurity: "none",
              caretColor: "#171717",

              "&::placeholder": {
                color: "transparent",
              },

              "&:focus": {
                border: "2px solid #e8bd18",
                background: "#ffe77c",
              },
            },
          }}
        />
        <Button
          type="submit"
          color="dark"
          h={52}
          miw={160}
          radius="xl"
          rightIcon={<TbArrowRight size={18} />}
        >
          {labels.receiveSubmit}
        </Button>
        <Divider />
        <Group spacing={8}>
          <TbShieldCheck size={18} />
          <Text size="xs" color="dimmed">
            {labels.receiveSecurity}
          </Text>
        </Group>
      </Stack>
    </form>
  );
};

export default Upload;
