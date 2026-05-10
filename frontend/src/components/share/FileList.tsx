import {
  ActionIcon,
  Box,
  Group,
  Skeleton,
  Stack,
  Table,
  TextInput,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { useModals } from "@mantine/modals";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { TbDownload, TbEye, TbLink } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import useTranslate from "../../hooks/useTranslate.hook";
import shareService from "../../services/share.service";
import { FileMetaData } from "../../types/File.type";
import { Share } from "../../types/share.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";
import TableSortIcon, { TableSort } from "../core/SortIcon";
import showFilePreviewModal from "./modals/showFilePreviewModal";

const FileList = ({
  files,
  setShare,
  share,
  isLoading,
}: {
  files?: FileMetaData[];
  setShare: Dispatch<SetStateAction<Share | undefined>>;
  share: Share;
  isLoading: boolean;
}) => {
  const clipboard = useClipboard();
  const modals = useModals();
  const t = useTranslate();

  const [sort, setSort] = useState<TableSort>({
    property: "name",
    direction: "desc",
  });

  const sortFiles = () => {
    if (files && sort.property) {
      const sortedFiles = files.sort((a: any, b: any) => {
        if (sort.direction === "asc") {
          return b[sort.property!].localeCompare(a[sort.property!], undefined, {
            numeric: true,
          });
        } else {
          return a[sort.property!].localeCompare(b[sort.property!], undefined, {
            numeric: true,
          });
        }
      });

      setShare({
        ...share,
        files: sortedFiles,
      });
    }
  };

  const copyFileLink = (file: FileMetaData) => {
    const link = `${window.location.origin}/api/shares/${
      share.id
    }/files/${file.id}`;

    if (window.isSecureContext) {
      clipboard.copy(link);
      toast.success(t("common.notify.copied-link"));
    } else {
      modals.openModal({
        title: t("share.modal.file-link"),
        children: (
          <Stack align="stretch">
            <TextInput variant="filled" value={link} />
          </Stack>
        ),
      });
    }
  };

  useEffect(sortFiles, [sort]);

  return (
    <Box
      sx={{
        display: "block",
        overflowX: "auto",
        border: "1px solid rgba(24, 25, 27, 0.08)",
        borderRadius: 12,
        background: "#fff",
      }}
    >
      <Table
        sx={{
          "thead tr": {
            height: 54,
            background: "#fff8df",
          },
          "th": {
            padding: "0 18px",
            color: "#1b1b1b",
            fontSize: 13,
          },
          "tbody tr": {
            height: 72,
          },
          "tbody tr + tr": {
            borderTop: "1px solid rgba(24, 25, 27, 0.08)",
          },
          "td": {
            padding: "0 18px",
            fontWeight: 700,
          },
        }}
      >
        <thead>
          <tr>
            <th>
              <Group spacing="xs">
                <FormattedMessage id="share.table.name" />
                <TableSortIcon sort={sort} setSort={setSort} property="name" />
              </Group>
            </th>
            <th>
              <Group spacing="xs">
                <FormattedMessage id="share.table.size" />
                <TableSortIcon sort={sort} setSort={setSort} property="size" />
              </Group>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? skeletonRows
            : files!.map((file) => (
                <tr key={file.name}>
                  <td>{file.name}</td>
                  <td>{byteToHumanSizeString(parseInt(file.size))}</td>
                  <td>
                    <Group position="right">
                      {shareService.doesFileSupportPreview(file.name) && (
                        <ActionIcon
                          onClick={() =>
                            showFilePreviewModal(share.id, file, modals)
                          }
                          size={38}
                          radius={19}
                          variant="light"
                        >
                          <TbEye />
                        </ActionIcon>
                      )}
                      {!share.hasPassword && (
                        <ActionIcon
                          size={38}
                          radius={19}
                          variant="light"
                          onClick={() => copyFileLink(file)}
                        >
                          <TbLink />
                        </ActionIcon>
                      )}
                      <ActionIcon
                        size={38}
                        radius={19}
                        variant="filled"
                        sx={{
                          background: "#171717",
                          "&:hover": {
                            background: "#2b2b2b",
                          },
                        }}
                        onClick={async () => {
                          await shareService.downloadFile(share.id, file.id);
                        }}
                      >
                        <TbDownload />
                      </ActionIcon>
                    </Group>
                  </td>
                </tr>
              ))}
        </tbody>
      </Table>
    </Box>
  );
};

const skeletonRows = [...Array(5)].map((c, i) => (
  <tr key={i}>
    <td>
      <Skeleton height={30} width={30} />
    </td>
    <td>
      <Skeleton height={14} />
    </td>
    <td>
      <Skeleton height={14} />
    </td>
    <td>
      <Skeleton height={25} width={25} />
    </td>
  </tr>
));

export default FileList;
