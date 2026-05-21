import { ActionIcon, Box, Button, Group, LoadingOverlay, Stack, Text, Title, Progress } from "@mantine/core";
import { useModals } from "@mantine/modals";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import pLimit from "p-limit";
import { TbArrowLeft, TbExternalLink, TbPlus, TbX } from "react-icons/tb";
import showErrorModal from "../../components/share/showErrorModal";
import shareService from "../../services/share.service";
import useTranslate from "../../hooks/useTranslate.hook";
import { FileMetaData, FileUpload } from "../../types/File.type";
import ReverseShareFileList from "../../components/upload/ReverseShareFileList";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";

export function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: { reverseShareToken: context.params!.reverseShareToken },
  };
}

const Share = ({ reverseShareToken }: { reverseShareToken: string }) => {
  const modals = useModals();
  const t = useTranslate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chunkSize = 1024 * 1024;
  const uploadConcurrency = pLimit(3);

  const [isLoading, setIsLoading] = useState(true);
  const [shareId, setShareId] = useState<string>("");
  const [reverseShareId, setReverseShareId] = useState<string>("");
  const [existingFiles, setExistingFiles] = useState<FileMetaData[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<FileUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const [maxShareSize, setMaxShareSize] = useState(0);
  const [simplified, setSimplified] = useState(false);

  const loadFiles = async (rsId: string) => {
    try {
      const files = await shareService.getMyReverseShareFiles(rsId);
      setExistingFiles(files);
    } catch (e) {
      console.error("Failed to load files:", e);
    }
  };

  useEffect(() => {
    shareService
      .setReverseShare(reverseShareToken)
      .then(async (reverseShareTokenData) => {
        setMaxShareSize(parseInt(reverseShareTokenData.maxShareSize));
        setSimplified(reverseShareTokenData.simplified);
        setReverseShareId(reverseShareTokenData.id);

        try {
          const id = await shareService.getReverseShareShareId(reverseShareTokenData.id);
          setShareId(id);
          await loadFiles(reverseShareTokenData.id);
        } catch (e) {
          console.error("Failed to load share info:", e);
        }

        setIsLoading(false);
      })
      .catch(() => {
        showErrorModal(
          modals,
          t("upload.reverse-share.error.invalid.title"),
          t("upload.reverse-share.error.invalid.description"),
          "go-home",
        );
        setIsLoading(false);
      });
  }, []);

  const handleRefreshFiles = () => {
    loadFiles(reverseShareId);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentSize = filesToUpload.reduce((total, file) => total + file.size, 0);
    const selectedSize = files.reduce((total, file) => total + file.size, 0);

    if (maxShareSize > 0 && currentSize + selectedSize > maxShareSize) {
      toast.error(t("upload.dropzone.notify.file-too-big", {
        maxSize: byteToHumanSizeString(maxShareSize),
      }));
      return;
    }

    const newFiles = files.map((file) => ({
      ...file,
      uploadingProgress: 0,
    } as FileUpload));

    setFilesToUpload((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setFilesToUpload((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartUpload = async () => {
    if (filesToUpload.length === 0) return;

    setIsUploading(true);
    const progressState: Record<string, number> = {};
    filesToUpload.forEach((_, i) => { progressState[`new_${i}`] = 0; });
    setUploadProgress(progressState);

    const chunkSize = 1024 * 1024;

const uploadPromises = filesToUpload.map(async (file, fileIndex) =>
uploadConcurrency(async () => {
        let fileId: string | undefined;

        const setFileProgress = (progress: number) => {
          setUploadProgress((prev) => ({
            ...prev,
            [`new_${fileIndex}`]: progress,
          }));
        };

        setFileProgress(1);

        let chunks = Math.ceil(file.size / chunkSize);
        if (chunks === 0) chunks++;

        for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex++) {
          const from = chunkIndex * chunkSize;
          const to = from + chunkSize;
          const blob = file.slice(from, to);

          try {
            const response = await shareService.uploadFile(
              shareId,
              blob,
              { id: fileId, name: file.name },
              chunkIndex,
              chunks,
            );
            fileId = response.id;
            setFileProgress(((chunkIndex + 1) / chunks) * 100);
          } catch (e) {
            setFileProgress(-1);
            return;
          }
        }
      })
    );

    try {
      await Promise.all(uploadPromises);
      toast.success("上传完成");
      setFilesToUpload([]);
      handleRefreshFiles();
      modals.openModal({
        title: "上传完成",
        children: <Text size="sm">文件已成功上传到闪包</Text>,
      });
    } catch (e) {
      toast.error("上传失败");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <LoadingOverlay visible />;

  const totalUploadSize = filesToUpload.reduce((total, file) => total + file.size, 0);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f7f7f7 0%, #ffffff 52%, #f0f0f0 100%)",
        padding: "80px 20px 56px",
      }}
    >
      <Box
        sx={{
          width: "min(800px, 100%)",
          margin: "0 auto",
        }}
      >
        <Group mb={20} position="apart" align="center">
          <Group spacing={10}>
            <Button
              component={Link}
              href="/account/reverseShares"
              leftIcon={<TbArrowLeft size={18} />}
              sx={{
                height: 48,
                padding: "0 22px",
                borderRadius: 999,
                background: "#f6f6f6",
                color: "#111111",
                fontWeight: 900,
                fontSize: 17,
                "&:hover": { background: "#eeeeee" },
              }}
            >
              我的闪包
            </Button>
          </Group>
          <Button
            component={Link}
            href={`/share/${shareId}`}
            rightIcon={<TbExternalLink size={18} />}
            sx={{
              height: 44,
              padding: "0 20px",
              borderRadius: 999,
              background: "#ffd84d",
              color: "#111111",
              fontWeight: 900,
              boxShadow: "0 8px 18px rgba(255, 216, 77, 0.28)",
              "&:hover": { background: "#ffdf68" },
            }}
          >
            查看分享
          </Button>
        </Group>

        <Stack align="stretch" spacing="xl">
          <Box
            sx={{
              background: "#fff",
              borderRadius: 24,
              boxShadow: "0 12px 34px rgba(0, 0, 0, 0.06)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                padding: "16px 24px",
                background: "linear-gradient(135deg, #ffd84d 0%, #ffe066 100%)",
                borderBottom: "1px solid #f0e5c8",
              }}
            >
              <Group position="apart" align="center">
                <Box>
                  <Title order={4} fw={900} c="dark">闪包文件</Title>
                  <Text size="xs" c="dark" mt={2}>
                    共 {existingFiles.length} 个文件 {filesToUpload.length > 0 && `，待上传 ${filesToUpload.length} 个`}
                  </Text>
                </Box>
                <Group spacing={12}>
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    style={{ display: "none" }}
                  />
                  <Button
                    leftIcon={<TbPlus size={18} />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      height: 40,
                      padding: "0 18px",
                      borderRadius: 999,
                      background: "#fff",
                      color: "#111",
                      fontWeight: 900,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      "&:hover": { background: "#f5f5f5" },
                    }}
                  >
                    添加文件
                  </Button>
                  <Button
                    onClick={handleStartUpload}
                    disabled={filesToUpload.length === 0 || isUploading}
                    loading={isUploading}
                    sx={{
                      height: 40,
                      padding: "0 18px",
                      borderRadius: 999,
                      background: filesToUpload.length === 0 ? "#e0e0e0" : "#ffd84d",
                      color: "#111",
                      fontWeight: 900,
                      boxShadow: filesToUpload.length === 0 ? "none" : "0 4px 12px rgba(255,216,77,0.3)",
                      "&:hover": { background: filesToUpload.length === 0 ? "#e0e0e0" : "#ffdf68" },
                    }}
                  >
                    开始上传{filesToUpload.length > 0 && ` (${filesToUpload.length})`}
                  </Button>
                </Group>
              </Group>
            </Box>

            {filesToUpload.length > 0 && (
              <Box px={24} py={12} style={{ borderBottom: "1px solid #f0f0f0", background: "#fff9df" }}>
                <Text size="sm" fw={900} mb={8}>待上传文件</Text>
                <Stack spacing={4}>
                  {filesToUpload.map((file, index) => (
                    <Group key={index} position="apart" py={4}>
                      <Text size="sm" fw={700} truncate style={{ maxWidth: 400 }}>
                        {file.name}
                      </Text>
                      <Group spacing={8}>
                        <Text size="xs" c="dimmed">{byteToHumanSizeString(file.size)}</Text>
                        {isUploading && uploadProgress[`new_${index}`] >= 0 && (
                          <Text size="xs" c="dimmed">{Math.round(uploadProgress[`new_${index}`])}%</Text>
                        )}
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="red"
                          onClick={() => handleRemoveFile(index)}
                          disabled={isUploading}
                        >
                          <TbX size={14} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  ))}
                </Stack>
              </Box>
            )}

            <Box p={24}>
              <ReverseShareFileList
                files={existingFiles}
                reverseShareId={reverseShareId}
                onFileDeleted={handleRefreshFiles}
              />
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default Share;