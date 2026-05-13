import {
  ActionIcon,
  Box,
  Group,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { useModals } from "@mantine/modals";
import { useState } from "react";
import { TbLink, TbTrash } from "react-icons/tb";
import CopyTextField from "./CopyTextField";
import shareService from "../../services/share.service";
import { FileMetaData } from "../../types/File.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";

const ReverseShareFileList = ({
  files,
  reverseShareId,
  onFileDeleted,
}: {
  files: FileMetaData[];
  reverseShareId: string;
  onFileDeleted: () => void;
}) => {
  const modals = useModals();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    modals.openConfirmModal({
      title: "确认删除",
      children: (
        <Text size="sm">
          确定要删除文件 "{fileName}" 吗？此操作不可恢复。
        </Text>
      ),
      confirmProps: {
        color: "red",
      },
      labels: {
        confirm: "删除",
        cancel: "取消",
      },
      onConfirm: async () => {
        setDeletingId(fileId);
        try {
          await shareService.deleteReverseShareFile(reverseShareId, fileId);
          toast.success("文件已删除");
          onFileDeleted();
        } catch (e) {
          toast.axiosError(e);
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const handleShareFile = async (fileId: string) => {
    try {
      const { shareId } = await shareService.getFileShareId(reverseShareId, fileId);
      const fileUrl = `${window.location.origin}/s/${shareId}`;
      modals.openModal({
        title: "分享文件",
        children: <CopyTextField link={fileUrl} />,
      });
    } catch (e) {
      toast.axiosError(e);
    }
  };

  if (files.length === 0) {
    return (
      <Box
        sx={{
          padding: "24px",
          textAlign: "center",
          color: "#888",
          border: "1px solid #eee",
          borderRadius: 16,
          background: "#fafafa",
        }}
      >
        <Text size="sm">暂无文件</Text>
        <Text size="xs" mt={4}>
          上传的文件将显示在这里
        </Text>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        overflowX: "auto",
        border: "1px solid #eee",
        borderRadius: 16,
        background: "#fff",
      }}
    >
      <Table sx={{ tableLayout: "fixed" }}>
        <thead>
          <tr style={{ background: "#fff9df", height: 64 }}>
            <th style={{ padding: "0 24px", fontWeight: 900, fontSize: 15, color: "#111", width: "50%" }}>
              文件名
            </th>
            <th style={{ padding: "0 24px", fontWeight: 900, fontSize: 15, color: "#111", textAlign: "center" }}>
              大小
            </th>
            <th style={{ padding: "0 24px", fontWeight: 900, fontSize: 15, color: "#111", textAlign: "center", width: 120 }}>
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id} style={{ height: 72, borderBottom: "1px solid #f0f0f0" }}>
              <td style={{ padding: "0 24px" }}>
                <Text size="sm" fw={700} truncate title={file.name}>
                  {file.name}
                </Text>
              </td>
              <td style={{ padding: "0 24px", textAlign: "center" }}>
                <Text size="sm" fw={900} c="dimmed">
                  {byteToHumanSizeString(parseInt(file.size))}
                </Text>
              </td>
              <td style={{ padding: "0 24px", textAlign: "center" }}>
                <Group spacing={8} position="center" noWrap>
                  <Tooltip label="分享链接">
                    <ActionIcon
                      size="lg"
                      radius="xl"
                      variant="filled"
                      color="yellow"
                      onClick={() => handleShareFile(file.id)}
                    >
                      <TbLink size={18} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="删除">
                    <ActionIcon
                      size="lg"
                      radius="xl"
                      variant="filled"
                      color="red"
                      loading={deletingId === file.id}
                      onClick={() => handleDeleteFile(file.id, file.name)}
                    >
                      <TbTrash size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
};

export default ReverseShareFileList;