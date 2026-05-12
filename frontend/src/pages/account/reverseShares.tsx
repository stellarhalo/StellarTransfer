import {
  ActionIcon,
  Box,
  Button,
  Center,
  Checkbox,
  createStyles,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { useModals } from "@mantine/modals";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  TbCloud,
  TbEdit,
  TbHistory,
  TbInfoCircle,
  TbLink,
  TbPlus,
  TbTrash,
} from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import Meta from "../../components/Meta";
import showEditReverseShareModal from "../../components/account/showEditReverseShareModal";
import showReverseShareInfoModal from "../../components/account/showReverseShareInfoModal";
import showReverseShareLinkModal from "../../components/account/showReverseShareLinkModal";
import showShareLinkModal from "../../components/account/showShareLinkModal";
import CenterLoader from "../../components/core/CenterLoader";
import DriveWorkspace from "../../components/layout/DriveWorkspace";
import showCreateReverseShareModal from "../../components/share/modals/showCreateReverseShareModal";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import shareService from "../../services/share.service";
import { MyReverseShare } from "../../types/share.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";

const useStyles = createStyles(() => ({
  tablePanel: {
    border: 0,
    boxShadow: "none",
    background: "#ffffff",
  },
  table: {
    "thead tr th": {
      borderBottom: 0,
      color: "#777777",
      fontSize: 15,
      fontWeight: 900,
      padding: "18px",
    },
    "tbody tr:hover": {
      background: "#fafafa",
    },
    "tbody tr td": {
      borderBottom: "1px solid #f0f0f0",
      padding: "18px",
      color: "#222222",
      fontWeight: 700,
      verticalAlign: "middle",
    },
  },
  actionIcon: {
    borderRadius: 12,
    background: "#f5f5f5",
    color: "#111111",
    "&:hover": {
      background: "#ffd84d",
    },
  },
  metaText: {
    color: "#b0b0b0",
    fontWeight: 800,
  },
}));

const MyShares = () => {
  const { classes } = useStyles();
  const modals = useModals();
  const clipboard = useClipboard();
  const t = useTranslate();

  const config = useConfig();

  const [reverseShares, setReverseShares] = useState<MyReverseShare[]>();
  const [search, setSearch] = useState("");
  const [selectedShareIds, setSelectedShareIds] = useState<string[]>([]);

  const getReverseShares = () => {
    shareService
      .getMyReverseShares()
      .then((shares) => setReverseShares(shares));
  };

  useEffect(() => {
    getReverseShares();
  }, []);

  if (!reverseShares) return <CenterLoader />;

  const filteredReverseShares = reverseShares.filter((reverseShare) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return [
      reverseShare.id,
      reverseShare.token,
      reverseShare.maxShareSize,
      reverseShare.shareExpiration,
      ...reverseShare.shares.map((share) => `${share.id} ${share.name ?? ""}`),
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const allSelected = selectedShareIds.length > 0 && selectedShareIds.length === filteredReverseShares.length;

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedShareIds(filteredReverseShares.map((share) => share.id));
    } else {
      setSelectedShareIds([]);
    }
  };

  const handleDeleteSelected = () => {
    modals.openConfirmModal({
      title: "确认删除",
      children: (
        <Text size="sm">
          确定要删除选中的 {selectedShareIds.length} 个闪包吗？此操作不可恢复。
        </Text>
      ),
      confirmProps: {
        color: "red",
      },
      labels: {
        confirm: t("common.button.delete"),
        cancel: t("common.button.cancel"),
      },
      onConfirm: () => {
        Promise.all(selectedShareIds.map((id) => shareService.removeReverseShare(id))).then(() => {
          setReverseShares(reverseShares.filter((share) => !selectedShareIds.includes(share.id)));
          setSelectedShareIds([]);
        });
      },
    });
  };

  return (
    <DriveWorkspace
      section="我的闪包"
      sectionHref="/account/shares"
      title="我的闪包"
      activePath="/account/reverseShares"
      searchPlaceholder="在我的闪包内搜索"
      searchValue={search}
      onSearchChange={setSearch}
      breadcrumbPrefix="账户信息"
      navItems={[
        {
          href: "/account/shares",
          icon: <TbHistory size={22} />,
          label: "我的共享",
        },
        {
          href: "/account/reverseShares",
          icon: <TbCloud size={22} />,
          label: "我的闪包",
        },
        {
          href: "/account",
          icon: <TbInfoCircle size={22} />,
          label: <FormattedMessage id="account.title" />,
        },
      ]}
      action={
        <Button
          onClick={() =>
            showCreateReverseShareModal(
              modals,
              config.get("smtp.enabled"),
              config.get("share.maxExpiration"),
              getReverseShares,
            )
          }
          leftIcon={<TbPlus size={18} />}
          sx={{
            height: 48,
            padding: "0 28px",
            borderRadius: 24,
            background: "#ffd84d",
            color: "#111111",
            fontWeight: 900,
            "&:hover": { background: "#ffdf68" },
          }}
        >
          新建
        </Button>
      }
    >
      <Meta title={t("account.reverseShares.title")} />
      <Group mb={24}>
        <Tooltip
          position="bottom"
          multiline
          width={220}
          label={t("account.reverseShares.description")}
          events={{ hover: true, focus: false, touch: true }}
        >
          <ActionIcon>
            <TbInfoCircle />
          </ActionIcon>
        </Tooltip>
        <Text color="dimmed" weight={700}>
          <FormattedMessage id="account.reverseShares.description" />
        </Text>
      </Group>
      {reverseShares.length == 0 ? (
        <Center style={{ height: "70vh" }}>
          <Stack align="center" spacing={10}>
            <Title order={3}>
              <FormattedMessage id="account.reverseShares.title.empty" />
            </Title>
            <Text>
              <FormattedMessage id="account.reverseShares.description.empty" />
            </Text>
          </Stack>
        </Center>
      ) : (
        <Paper className={classes.tablePanel}>
          <Group mb={24} spacing={14}>
            <Checkbox
              size="lg"
              radius="sm"
              checked={allSelected}
              onChange={(e) => handleSelectAllChange(e.currentTarget.checked)}
            />
            <Text weight={900} size="lg">
              共 {filteredReverseShares.length} 项
            </Text>
            {selectedShareIds.length > 0 && (
              <Button
                color="red"
                variant="light"
                onClick={handleDeleteSelected}
              >
                删除已选 ({selectedShareIds.length})
              </Button>
            )}
          </Group>
          <Box sx={{ display: "block", overflowX: "auto" }}>
            <Table className={classes.table}>
              <thead>
                <tr>
                  <th style={{ width: 50 }}></th>
                  <th>
                    <FormattedMessage id="account.reverseShares.table.shares" />
                  </th>
                  <th>
                    <FormattedMessage id="account.reverseShares.table.max-size" />
                  </th>
                  <th>
                    <FormattedMessage id="account.reverseShares.table.expires" />
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredReverseShares.map((reverseShare) => (
                  <tr key={reverseShare.id}>
                    <td style={{ width: 50 }}>
                      <Checkbox
                        size="lg"
                        radius="sm"
                        checked={selectedShareIds.includes(reverseShare.id)}
                        onChange={() => {
                          if (selectedShareIds.includes(reverseShare.id)) {
                            setSelectedShareIds(selectedShareIds.filter((id) => id !== reverseShare.id));
                          } else {
                            setSelectedShareIds([...selectedShareIds, reverseShare.id]);
                          }
                        }}
                      />
                    </td>
                    <td style={{ width: 220 }}>
                      <Stack spacing={4}>
                        <Text weight={900}>{reverseShare.name || "未命名闪包"}</Text>
                      </Stack>
                    </td>
                    <td>
                      {byteToHumanSizeString(
                        parseInt(reverseShare.maxShareSize),
                      )}
                    </td>
                    <td>
                      {moment(reverseShare.shareExpiration).unix() === 0
                        ? "Never"
                        : moment(reverseShare.shareExpiration).format("LLL")}
                    </td>
                    <td>
                      <Group position="right">
                        <ActionIcon
                          className={classes.actionIcon}
                          size={34}
                          onClick={() => {
                            showEditReverseShareModal(
                              modals,
                              reverseShare,
                              config.get("share.maxExpiration"),
                              getReverseShares,
                            );
                          }}
                        >
                          <TbEdit />
                        </ActionIcon>
                        <ActionIcon
                          className={classes.actionIcon}
                          size={34}
                          onClick={() => {
                            showReverseShareInfoModal(modals, reverseShare);
                          }}
                        >
                          <TbInfoCircle />
                        </ActionIcon>
                        <ActionIcon
                          className={classes.actionIcon}
                          size={34}
                          onClick={() => {
                            if (window.isSecureContext) {
                              clipboard.copy(
                                `${window.location.origin}/upload/${
                                  reverseShare.token
                                }`,
                              );
                              toast.success(t("common.notify.copied-link"));
                            } else {
                              showReverseShareLinkModal(
                                modals,
                                reverseShare.token,
                              );
                            }
                          }}
                        >
                          <TbLink />
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          size={34}
                          onClick={() => {
                            modals.openConfirmModal({
                              title: t(
                                "account.reverseShares.modal.delete.title",
                              ),
                              children: (
                                <Text size="sm">
                                  <FormattedMessage id="account.reverseShares.modal.delete.description" />
                                </Text>
                              ),
                              confirmProps: {
                                color: "red",
                              },
                              labels: {
                                confirm: t("common.button.delete"),
                                cancel: t("common.button.cancel"),
                              },
                              onConfirm: () => {
                                shareService.removeReverseShare(
                                  reverseShare.id,
                                );
                                setReverseShares(
                                  reverseShares.filter(
                                    (item) => item.id !== reverseShare.id,
                                  ),
                                );
                              },
                            });
                          }}
                        >
                          <TbTrash />
                        </ActionIcon>
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>
        </Paper>
      )}
    </DriveWorkspace>
  );
};

export default MyShares;
