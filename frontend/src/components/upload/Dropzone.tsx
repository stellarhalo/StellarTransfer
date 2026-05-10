import { Button, Center, createStyles, Group, Text } from "@mantine/core";
import { Dropzone as MantineDropzone } from "@mantine/dropzone";
import { ForwardedRef, useRef } from "react";
import { TbCloudUpload, TbInbox, TbPlus, TbUpload } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import useTranslate from "../../hooks/useTranslate.hook";
import { FileUpload } from "../../types/File.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
    marginBottom: 30,
  },

  cowWrapper: {
    position: "relative",
    zIndex: 5,
    width: "min(468px, calc(100vw - 32px))",
    marginBottom: 0,
  },

  dropzone: {
    borderWidth: 1,
    paddingBottom: 50,
  },

  cowDropzone: {
    border: 0,
    padding: 0,
    background: "transparent",
    overflow: "visible",

    "&:hover": {
      background: "transparent",
    },
  },

  icon: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[4],
  },

  control: {
    position: "absolute",
    bottom: -20,
  },

  cowCard: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: 88,
    gap: 18,
    padding: "14px 16px 14px 22px",
    borderRadius: 999,
    background:
      theme.colorScheme === "dark"
        ? "rgba(255, 255, 255, 0.94)"
        : "rgba(255, 255, 255, 0.96)",
    color: "#18191c",
    boxShadow: "0 22px 60px rgba(21, 34, 48, 0.2)",
    transition: "transform 160ms ease, box-shadow 160ms ease",

    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 26px 70px rgba(21, 34, 48, 0.26)",
    },

    [theme.fn.smallerThan("xs")]: {
      height: 76,
      gap: 12,
      padding: "12px",
    },
  },

  cowPlus: {
    display: "grid",
    placeItems: "center",
    flex: "0 0 52px",
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "#f8f8f8",
    color: "#0b0d10",
  },

  cowText: {
    flex: 1,
    minWidth: 0,
  },

  cowTitle: {
    color: "#17191d",
    fontSize: 26,
    lineHeight: 1.05,
    fontWeight: 900,

    [theme.fn.smallerThan("xs")]: {
      fontSize: 22,
    },
  },

  cowDescription: {
    color: "#4d5159",
    fontSize: 12,
    marginTop: 6,

    [theme.fn.smallerThan("xs")]: {
      display: "none",
    },
  },

  cowReceive: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 8,
    flex: "0 0 auto",
    width: 126,
    height: 56,
    paddingLeft: 0,
    paddingRight: 0,
    borderRadius: 999,
    border: 0,
    background: "#f1f1f1",
    color: "#34363a",
    fontWeight: 800,

    "&:hover": {
      background: "#e7e7e7",
    },

    [theme.fn.smallerThan("xs")]: {
      width: 104,
      height: 48,
    },
  },
}));

const Dropzone = ({
  title,
  isUploading,
  maxShareSize,
  onFilesChanged,
  onReceive,
  variant = "default",
}: {
  title?: string;
  isUploading: boolean;
  maxShareSize: number;
  onFilesChanged: (files: FileUpload[]) => void;
  onReceive?: () => void;
  variant?: "default" | "cowTransfer";
}) => {
  const t = useTranslate();

  const { classes } = useStyles();
  const openRef = useRef<() => void>();

  const dropzoneContent =
    variant == "cowTransfer" ? (
      <div className={classes.cowCard}>
        <div className={classes.cowPlus}>
          <TbPlus size={34} strokeWidth={3} />
        </div>
        <div className={classes.cowText}>
          <Text className={classes.cowTitle}>
            {title || <FormattedMessage id="upload.dropzone.title" />}
          </Text>
        </div>
      </div>
    ) : (
      <div style={{ pointerEvents: "none" }}>
        <Group position="center">
          <TbCloudUpload size={50} />
        </Group>
        <Text align="center" weight={700} size="lg" mt="xl">
          {title || <FormattedMessage id="upload.dropzone.title" />}
        </Text>
        <Text align="center" size="sm" mt="xs" color="dimmed">
          <FormattedMessage
            id="upload.dropzone.description"
            values={{ maxSize: byteToHumanSizeString(maxShareSize) }}
          />
        </Text>
      </div>
    );

  return (
    <div
      className={
        variant == "cowTransfer" ? classes.cowWrapper : classes.wrapper
      }
    >
      <MantineDropzone
        onReject={(e) => {
          toast.error(e[0].errors[0].message);
        }}
        disabled={isUploading}
        openRef={openRef as ForwardedRef<() => void>}
        onDrop={(files: FileUpload[]) => {
          const fileSizeSum = files.reduce((n, { size }) => n + size, 0);

          if (maxShareSize > 0 && fileSizeSum > maxShareSize) {
            toast.error(
              t("upload.dropzone.notify.file-too-big", {
                maxSize: byteToHumanSizeString(maxShareSize),
              }),
            );
          } else {
            files = files.map((newFile) => {
              newFile.uploadingProgress = 0;
              return newFile;
            });
            onFilesChanged(files);
          }
        }}
        className={
          variant == "cowTransfer" ? classes.cowDropzone : classes.dropzone
        }
        radius="md"
      >
        {dropzoneContent}
      </MantineDropzone>
      {variant == "cowTransfer" && (
        <Button
          className={classes.cowReceive}
          leftIcon={<TbInbox size={18} />}
          disabled={isUploading}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onReceive?.();
          }}
        >
          接受文件
        </Button>
      )}
      {variant == "default" && (
        <Center>
          <Button
            className={classes.control}
            variant="light"
            size="sm"
            radius="xl"
            disabled={isUploading}
            onClick={() => openRef.current && openRef.current()}
          >
            {<TbUpload />}
          </Button>
        </Center>
      )}
    </div>
  );
};
export default Dropzone;
