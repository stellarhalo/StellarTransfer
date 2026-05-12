import {
  ActionIcon,
  Box,
  Button,
  createStyles,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { cleanNotifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import { useRouter } from "next/router";
import pLimit from "p-limit";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import { GrUndo } from "react-icons/gr";
import { TbPlus, TbTrash } from "react-icons/tb";
import UploadProgressIndicator from "../../components/upload/UploadProgressIndicator";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import shareService from "../../services/share.service";
import { FileListItem, FileMetaData, FileUpload } from "../../types/File.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";

const promiseLimit = pLimit(3);
let errorToastShown = false;

const useStyles = createStyles((theme) => ({
  card: {
    overflow: "hidden",
    border: "1px solid #eeeeee",
    borderRadius: 24,
    background: "#ffffff",
    boxShadow: "0 12px 34px rgba(0, 0, 0, 0.06)",
  },
  header: {
    padding: "30px 36px",
    background: "linear-gradient(135deg, #ffd84d 0%, #ffe066 100%)",
    borderBottom: "1px solid #f0e5c8",

    [theme.fn.smallerThan("sm")]: {
      padding: "24px 20px",
    },
  },
  body: {
    padding: "50px 36px 36px",

    [theme.fn.smallerThan("sm")]: {
      padding: "24px 18px 28px",
    },
  },
  saveButton: {
    height: 52,
    padding: "0 28px",
    borderRadius: 999,
    background: "#ffd84d",
    color: "#111111",
    fontWeight: 900,
    boxShadow: "0 8px 20px rgba(255, 216, 77, 0.35)",

    "&:hover": {
      background: "#ffdf68",
      transform: "translateY(-1px)",
    },
  },
  transferHeader: {
    marginBottom: 40,
  },
  transferTitle: {
    fontSize: 28,
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: 0,

    [theme.fn.smallerThan("sm")]: {
      fontSize: 34,
    },
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "#ffdc5a",
    color: "#111111",
    boxShadow: "0 12px 26px rgba(255, 216, 77, 0.35)",
    transition: "transform 160ms ease, background 160ms ease",

    "&:hover": {
      background: "#ffe27a",
      transform: "translateY(-1px) scale(1.02)",
    },

    [theme.fn.smallerThan("sm")]: {
      width: 64,
      height: 64,
    },
  },
  totalText: {
    color: "#8f969f",
    fontSize: 18,
    fontWeight: 900,

    [theme.fn.smallerThan("sm")]: {
      fontSize: 20,
    },
  },
  listCard: {
    overflow: "hidden",
    borderRadius: 20,
    border: "1px solid #eeeeee",
    background: "#ffffff",
    boxShadow: "0 12px 34px rgba(0, 0, 0, 0.06)",
  },
  table: {
    tableLayout: "fixed",

    "thead tr": {
      height: 76,
      background: "#fff9df",
    },
    "thead tr th": {
      borderBottom: "1px solid #eee8d0",
      color: "#111111",
      fontSize: 16,
      fontWeight: 900,
      padding: "0 28px",
    },
    "tbody tr": {
      height: 96,
      transition: "background 140ms ease",

      "&:hover": {
        background: "#fafafa",
      },
    },
    "tbody tr td": {
      borderBottom: "1px solid #f0f0f0",
      padding: "0 20px",
      verticalAlign: "middle",
    },
    "tbody tr:last-of-type td": {
      borderBottom: 0,
    },
  },
  fileName: {
    color: "#000000",
    fontSize: 16,
    fontWeight: 900,
    lineHeight: 1.2,

    [theme.fn.smallerThan("sm")]: {
      fontSize: 18,
    },
  },
  fileSize: {
    color: "#8f969f",
    fontSize: 14,
    fontWeight: 900,
    textAlign: "center",

    [theme.fn.smallerThan("sm")]: {
      fontSize: 18,
    },
  },
  rowDeleted: {
    color: "rgba(120, 120, 120, 0.5)",
    textDecoration: "line-through",
  },
  removeButton: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "#fff3f3",
    color: "#ff5555",

    "&:hover": {
      background: "#ffe3e3",
    },
  },
  restoreButton: {
    width: 52,
    height: 52,
    borderRadius: "50%",
  },
}));

const EditableUpload = ({
  maxShareSize,
  shareId,
  files: savedFiles = [],
}: {
  maxShareSize?: number;
  isReverseShare?: boolean;
  shareId: string;
  files?: FileMetaData[];
}) => {
  const { classes } = useStyles();
  const t = useTranslate();
  const router = useRouter();
  const config = useConfig();

  const chunkSize = useRef(parseInt(config.get("share.chunkSize")));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [existingFiles, setExistingFiles] =
    useState<Array<FileMetaData & { deleted?: boolean }>>(savedFiles);
  const [uploadingFiles, setUploadingFiles] = useState<FileUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const existingAndUploadedFiles: FileListItem[] = useMemo(
    () => [...uploadingFiles, ...existingFiles],
    [existingFiles, uploadingFiles],
  );
  const dirty = useMemo(() => {
    return (
      existingFiles.some((file) => !!file.deleted) || !!uploadingFiles.length
    );
  }, [existingFiles, uploadingFiles]);

  maxShareSize ??= parseInt(config.get("share.maxSize"));

  const uploadFiles = async (files: FileUpload[]) => {
    const fileUploadPromises = files.map(async (file, fileIndex) =>
      // Limit the number of concurrent uploads to 3
      promiseLimit(async () => {
        let fileId: string | undefined;

        const setFileProgress = (progress: number) => {
          setUploadingFiles((files) =>
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
                shareId,
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

    await Promise.all(fileUploadPromises);
  };

  const removeFiles = async () => {
    const removedFiles = existingFiles.filter((file) => !!file.deleted);

    if (removedFiles.length > 0) {
      await Promise.all(
        removedFiles.map(async (file) => {
          await shareService.removeFile(shareId, file.id);
        }),
      );

      setExistingFiles(existingFiles.filter((file) => !file.deleted));
    }
  };

  const revertComplete = async () => {
    await shareService.revertComplete(shareId).then();
  };

  const completeShare = async () => {
    return await shareService.completeShare(shareId);
  };

  const save = async () => {
    setIsUploading(true);

    try {
      await revertComplete();
      await uploadFiles(uploadingFiles);

      const hasFailed = uploadingFiles.some(
        (file) => file.uploadingProgress == -1,
      );

      if (!hasFailed) {
        await removeFiles();
      }

      await completeShare();

      if (!hasFailed) {
        toast.success(t("share.edit.notify.save-success"));
        router.back();
      }
    } catch {
      toast.error(t("share.edit.notify.generic-error"));
    } finally {
      setIsUploading(false);
    }
  };

  const appendFiles = (appendingFiles: FileUpload[]) => {
    setUploadingFiles([...appendingFiles, ...uploadingFiles]);
  };

  const addFiles = (selectedFiles: FileUpload[]) => {
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
      return;
    }

    appendFiles(
      selectedFiles.map((file) => {
        file.uploadingProgress = 0;
        return file;
      }),
    );
  };

  const totalSize = existingAndUploadedFiles
    .filter((file) => !("deleted" in file && file.deleted))
    .reduce((total, file) => total + Number(file.size), 0);

  const remove = (index: number) => {
    const file = existingAndUploadedFiles[index];

    if ("uploadingProgress" in file) {
      setUploadingFiles(uploadingFiles.filter((item) => item !== file));
    } else {
      setExistingFiles(
        existingFiles.map((item) =>
          item.id === file.id ? { ...item, deleted: true } : item,
        ),
      );
    }
  };

  const restore = (index: number) => {
    const file = existingAndUploadedFiles[index];
    if ("uploadingProgress" in file) return;

    setExistingFiles(
      existingFiles.map((item) =>
        item.id === file.id ? { ...item, deleted: false } : item,
      ),
    );
  };

  useEffect(() => {
    // Check if there are any files that failed to upload
    const fileErrorCount = uploadingFiles.filter(
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
  }, [uploadingFiles]);

  return (
    <Paper className={classes.card}>
      <Box className={classes.header}>
        <Group position="apart" align="flex-start" noWrap>
          <Box>
            <Title order={2} weight={900}>
              编辑分享
            </Title>
            <Text color="dark" weight={400} mt={8}>
              添加新文件或移除已有文件，保存后分享内容会立即更新。
            </Text>
          </Box>
        </Group>
      </Box>
      <Stack className={classes.body} spacing={22}>
        <Group className={classes.transferHeader} position="apart" noWrap>
          <Group spacing={28} noWrap>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={(event) => {
                addFiles(
                  Array.from(event.currentTarget.files || []) as FileUpload[],
                );
                event.currentTarget.value = "";
              }}
            />
            <ActionIcon
              className={classes.addButton}
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <TbPlus size={26} strokeWidth={2.6} />
            </ActionIcon>
          </Group>
          <Text className={classes.totalText}>
            共 {byteToHumanSizeString(totalSize)}
          </Text>
        </Group>
        {existingAndUploadedFiles.length > 0 && (
          <Paper className={classes.listCard}>
            <Table className={classes.table}>
              <thead>
                <tr>
                  <th>文件名</th>
                  <th style={{ textAlign: "center", width: 150 }}>文件大小</th>
                  <th style={{ width: 88 }}></th>
                </tr>
              </thead>
              <tbody>
                {existingAndUploadedFiles.map((file, index) => {
                  const uploadable = "uploadingProgress" in file;
                  const uploading = uploadable && file.uploadingProgress !== 0;
                  const removable = uploadable
                    ? file.uploadingProgress === 0
                    : !file.deleted;
                  const restorable = !uploadable && !!file.deleted;
                  const deleted = !uploadable && !!file.deleted;

                  return (
                    <tr
                      key={`${file.name}-${index}`}
                      className={deleted ? classes.rowDeleted : undefined}
                    >
                      <td>
                        <Text className={classes.fileName} lineClamp={2}>
                          {file.name}
                        </Text>
                      </td>
                      <td>
                        <Text className={classes.fileSize}>
                          {byteToHumanSizeString(Number(file.size))}
                        </Text>
                      </td>
                      <td>
                        <Group position="center">
                          {removable && (
                            <ActionIcon
                              className={classes.removeButton}
                              onClick={() => remove(index)}
                            >
                              <TbTrash size={24} />
                            </ActionIcon>
                          )}
                          {uploading && (
                            <UploadProgressIndicator
                              progress={file.uploadingProgress}
                            />
                          )}
                          {restorable && (
                            <ActionIcon
                              color="yellow"
                              variant="light"
                              className={classes.restoreButton}
                              onClick={() => restore(index)}
                            >
                              <GrUndo size={20} />
                            </ActionIcon>
                          )}
                        </Group>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Paper>
        )}
        {existingAndUploadedFiles.length === 0 && (
          <Paper className={classes.listCard} p={36}>
            <Text color="dimmed" weight={800} align="center">
              点击上方 + 追加文件
            </Text>
          </Paper>
        )}
        <Button
          loading={isUploading}
          disabled={!dirty}
          onClick={() => save()}
          className={classes.saveButton}
          ml="auto"
        >
          <FormattedMessage id="common.button.save" />
        </Button>
      </Stack>
    </Paper>
  );
};
export default EditableUpload;
