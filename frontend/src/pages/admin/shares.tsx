import {
  Box,
  Group,
  Paper,
  Space,
  Text,
  Title,
  createStyles,
} from "@mantine/core";
import { useModals } from "@mantine/modals";
import { useEffect, useState } from "react";
import { TbLink, TbSettings, TbUsers } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import Meta from "../../components/Meta";
import ManageShareTable from "../../components/admin/shares/ManageShareTable";
import DriveWorkspace from "../../components/layout/DriveWorkspace";
import useTranslate from "../../hooks/useTranslate.hook";
import shareService from "../../services/share.service";
import { MyShare } from "../../types/share.type";
import toast from "../../utils/toast.util";

const useStyles = createStyles(() => ({
  header: {
    marginBottom: 24,
  },
  tablePanel: {
    border: "1px solid #eeeeee",
    borderRadius: 24,
    boxShadow: "0 12px 34px rgba(0, 0, 0, 0.05)",
    background: "#ffffff",
    overflow: "hidden",
  },
}));

const Shares = () => {
  const { classes } = useStyles();
  const [shares, setShares] = useState<MyShare[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const modals = useModals();
  const t = useTranslate();

  const getShares = () => {
    setIsLoading(true);
    shareService.list().then((shares) => {
      setShares(shares);
      setIsLoading(false);
    });
  };

  const deleteShare = (share: MyShare) => {
    modals.openConfirmModal({
      title: t("admin.shares.edit.delete.title", {
        id: share.id,
      }),
      children: (
        <Text size="sm">
          <FormattedMessage id="admin.shares.edit.delete.description" />
        </Text>
      ),
      labels: {
        confirm: t("common.button.delete"),
        cancel: t("common.button.cancel"),
      },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        shareService
          .remove(share.id)
          .then(() => setShares(shares.filter((v) => v.id != share.id)))
          .catch(toast.axiosError);
      },
    });
  };

  useEffect(() => {
    getShares();
  }, []);

  const filteredShares = shares.filter((share) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return [
      share.id,
      share.name,
      share.creator?.username,
      share.creator?.email,
      share.views,
      share.size,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return (
    <DriveWorkspace
      section="管理后台"
      sectionHref="/admin/users"
      title={<FormattedMessage id="admin.shares.title" />}
      activePath="/admin/shares"
      searchPlaceholder="在共享记录内搜索"
      searchValue={search}
      onSearchChange={setSearch}
      breadcrumbPrefix="管理"
      navItems={[
        {
          href: "/admin/users",
          icon: <TbUsers size={22} />,
          label: <FormattedMessage id="admin.button.users" />,
        },
        {
          href: "/admin/shares",
          icon: <TbLink size={22} />,
          label: <FormattedMessage id="admin.button.shares" />,
        },
        {
          href: "/admin/config/general",
          icon: <TbSettings size={22} />,
          label: <FormattedMessage id="admin.button.config" />,
        },
      ]}
      action={null}
    >
      <Meta title={t("admin.shares.title")} />
      <Group className={classes.header} position="apart" align="baseline">
        <Title mb={30} order={3}>
          <FormattedMessage id="admin.shares.title" />
        </Title>
      </Group>
      <Paper className={classes.tablePanel}>
        <Box p={22}>
          <Text weight={900} size="lg">
            共 {filteredShares.length} 项
          </Text>
        </Box>
        <ManageShareTable
          shares={filteredShares}
          deleteShare={deleteShare}
          isLoading={isLoading}
        />
      </Paper>
      <Space h="xl" />
    </DriveWorkspace>
  );
};

export default Shares;
