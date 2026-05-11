import {
  ActionIcon,
  Box,
  Button,
  Center,
  Checkbox,
  createStyles,
  Group,
  Paper,
  Space,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { useModals } from "@mantine/modals";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  TbCloud,
  TbEdit,
  TbHistory,
  TbInfoCircle,
  TbLink,
  TbLock,
  TbPlus,
  TbTrash,
} from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import Meta from "../../components/Meta";
import showShareInformationsModal from "../../components/account/showShareInformationsModal";
import showShareLinkModal from "../../components/account/showShareLinkModal";
import CenterLoader from "../../components/core/CenterLoader";
import DriveWorkspace from "../../components/layout/DriveWorkspace";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import shareService from "../../services/share.service";
import { MyShare } from "../../types/share.type";
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
      padding: "18px 18px",
    },
    "tbody tr": {
      transition: "background 140ms ease",
      "&:hover": {
        background: "#fafafa",
      },
    },
    "tbody tr td": {
      borderBottom: "1px solid #f0f0f0",
      padding: "18px 18px",
      color: "#222222",
      fontWeight: 700,
    },
  },
  fileName: {
    fontSize: 17,
    fontWeight: 900,
  },
  metaText: {
    color: "#b0b0b0",
    fontWeight: 800,
  },
  actionIcon: {
    borderRadius: 12,
    background: "#f5f5f5",
    color: "#111111",
    "&:hover": {
      background: "#ffd84d",
    },
  },
}));

const MyShares = () => {
  const { classes } = useStyles();
  const modals = useModals();
  const clipboard = useClipboard();
  const config = useConfig();
  const t = useTranslate();

  const [shares, setShares] = useState<MyShare[]>();
  const [search, setSearch] = useState("");

  useEffect(() => {
    shareService.getMyShares().then((shares) => setShares(shares));
  }, []);

  if (!shares) return <CenterLoader />;

  const filteredShares = shares.filter((share) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return [share.id, share.name, share.views, share.expiration]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return (
    <DriveWorkspace
      section="我的闪包"
      sectionHref="/account/shares"
      title={<FormattedMessage id="account.shares.title" />}
      activePath="/account/shares"
      searchPlaceholder="在我的闪包内搜索"
      searchValue={search}
      onSearchChange={setSearch}
      navItems={[
        {
          href: "/account/shares",
          icon: <TbCloud size={22} />,
          label: <FormattedMessage id="account.shares.title" />,
        },
        {
          href: "/account/reverseShares",
          icon: <TbHistory size={22} />,
          label: <FormattedMessage id="account.reverseShares.title" />,
        },
        {
          href: "/account",
          icon: <TbInfoCircle size={22} />,
          label: <FormattedMessage id="account.title" />,
        },
      ]}
      action={
        <Button
          component={Link}
          href="/upload"
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
      <Meta title={t("account.shares.title")} />
      {shares.length == 0 ? (
        <Center style={{ height: "70vh" }}>
          <Stack align="center" spacing={10}>
            <Title order={3}>
              <FormattedMessage id="account.shares.title.empty" />
            </Title>
            <Text>
              <FormattedMessage id="account.shares.description.empty" />
            </Text>
            <Space h={5} />
            <Button component={Link} href="/upload" variant="light">
              <FormattedMessage id="account.shares.button.create" />
            </Button>
          </Stack>
        </Center>
      ) : (
        <Paper className={classes.tablePanel}>
          <Group mb={24} spacing={14}>
            <Checkbox size="lg" radius="sm" />
            <Text weight={900} size="lg">
              共 {filteredShares.length} 项
            </Text>
          </Group>
          <Box sx={{ display: "block", overflowX: "auto" }}>
            <Table className={classes.table}>
              <thead>
                <tr>
                  <th>
                    <FormattedMessage id="account.shares.table.id" />
                  </th>
                  <th>
                    <FormattedMessage id="account.shares.table.name" />
                  </th>
                  <th>
                    <FormattedMessage id="account.shares.table.visitors" />
                  </th>
                  <th>
                    <FormattedMessage id="account.shares.table.expiresAt" />
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredShares.map((share) => (
                  <tr key={share.id}>
                    <td>
                      <Stack spacing={4}>
                        <Group spacing="xs">
                          <Text className={classes.fileName}>{share.id}</Text>
                          {share.security.passwordProtected && (
                            <TbLock
                              color="orange"
                              title={t(
                                "account.shares.table.password-protected",
                              )}
                            />
                          )}
                        </Group>
                        <Text size="sm" className={classes.metaText}>
                          {share.name || "未命名共享"}
                        </Text>
                      </Stack>
                    </td>
                    <td>{share.name}</td>
                    <td>
                      {share.security.maxViews ? (
                        <FormattedMessage
                          id="account.shares.table.visitor-count"
                          values={{
                            count: share.views,
                            max: share.security.maxViews,
                          }}
                        />
                      ) : (
                        share.views
                      )}
                    </td>
                    <td>
                      {moment(share.expiration).unix() === 0 ? (
                        <FormattedMessage id="account.shares.table.expiry-never" />
                      ) : (
                        moment(share.expiration).format("LLL")
                      )}
                    </td>
                    <td>
                      <Group position="right">
                        <Link href={`/share/${share.id}/edit`}>
                          <ActionIcon className={classes.actionIcon} size={34}>
                            <TbEdit />
                          </ActionIcon>
                        </Link>
                        <ActionIcon
                          className={classes.actionIcon}
                          size={34}
                          onClick={() => {
                            showShareInformationsModal(
                              modals,
                              share,
                              parseInt(config.get("share.maxSize")),
                            );
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
                                `${window.location.origin}/s/${share.id}`,
                              );
                              toast.success(t("common.notify.copied-link"));
                            } else {
                              showShareLinkModal(modals, share.id);
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
                              title: t("account.shares.modal.delete.title", {
                                share: share.id,
                              }),
                              children: (
                                <Text size="sm">
                                  <FormattedMessage id="account.shares.modal.delete.description" />
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
                                shareService.remove(share.id);
                                setShares(
                                  shares.filter((item) => item.id !== share.id),
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
