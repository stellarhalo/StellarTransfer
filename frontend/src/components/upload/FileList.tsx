import { ActionIcon, Box, Group, Table, Text } from "@mantine/core";
import { TbTrash } from "react-icons/tb";
import { GrUndo } from "react-icons/gr";
import { FileListItem } from "../../types/File.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import UploadProgressIndicator from "./UploadProgressIndicator";
import { FormattedMessage } from "react-intl";

const FileListRow = ({
  file,
  onRemove,
  onRestore,
}: {
  file: FileListItem;
  onRemove?: () => void;
  onRestore?: () => void;
}) => {
  {
    const uploadable = "uploadingProgress" in file;
    const uploading = uploadable && file.uploadingProgress !== 0;
    const removable = uploadable
      ? file.uploadingProgress === 0
      : onRemove && !file.deleted;
    const restorable = onRestore && !uploadable && !!file.deleted; // maybe undefined, force boolean
    const deleted = !uploadable && !!file.deleted;

    return (
      <tr
        style={{
          color: deleted ? "rgba(120, 120, 120, 0.5)" : "inherit",
          textDecoration: deleted ? "line-through" : "none",
          height: 72,
        }}
      >
        <td>
          <Text weight={800} lineClamp={1}>
            {file.name}
          </Text>
        </td>
        <td>
          <Text size="sm" color="dimmed" weight={700}>
            {byteToHumanSizeString(+file.size)}
          </Text>
        </td>
        <td style={{ width: 84 }}>
          {removable && (
            <ActionIcon
              color="red"
              variant="light"
              size={38}
              radius={19}
              onClick={onRemove}
            >
              <TbTrash />
            </ActionIcon>
          )}
          {uploading && (
            <UploadProgressIndicator progress={file.uploadingProgress} />
          )}
          {restorable && (
            <ActionIcon
              color="primary"
              variant="light"
              size={38}
              radius={19}
              onClick={onRestore}
            >
              <GrUndo />
            </ActionIcon>
          )}
        </td>
      </tr>
    );
  }
};

const FileList = <T extends FileListItem = FileListItem>({
  files,
  setFiles,
}: {
  files: T[];
  setFiles: (files: T[]) => void;
}) => {
  const remove = (index: number) => {
    const file = files[index];

    if ("uploadingProgress" in file) {
      files.splice(index, 1);
    } else {
      files[index] = { ...file, deleted: true };
    }

    setFiles([...files]);
  };

  const restore = (index: number) => {
    const file = files[index];

    if ("uploadingProgress" in file) {
      return;
    } else {
      files[index] = { ...file, deleted: false };
    }

    setFiles([...files]);
  };

  const rows = files.map((file, i) => (
    <FileListRow
      key={i}
      file={file}
      onRemove={() => remove(i)}
      onRestore={() => restore(i)}
    />
  ));

  return (
    <Box
      sx={{
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(24, 25, 27, 0.08)",
        background: "#fff",
        boxShadow: "0 16px 42px rgba(24, 25, 27, 0.08)",
      }}
    >
      <Group
        position="apart"
        sx={{
          minHeight: 54,
          padding: "0 18px",
          background: "#fff8df",
          borderBottom: "1px solid rgba(24, 25, 27, 0.08)",
        }}
      >
        <Text size="sm" weight={900}>
          <FormattedMessage id="upload.filelist.name" />
        </Text>
        <Text size="sm" weight={900}>
          <FormattedMessage id="upload.filelist.size" />
        </Text>
      </Group>
      <Table
        verticalSpacing={0}
        sx={{
          "tbody tr + tr": {
            borderTop: "1px solid rgba(24, 25, 27, 0.08)",
          },
          "td": {
            padding: "0 18px",
          },
        }}
      >
        <tbody>{rows}</tbody>
      </Table>
    </Box>
  );
};

export default FileList;
