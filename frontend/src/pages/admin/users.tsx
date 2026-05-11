import {
  Box,
  Button,
  createStyles,
  Group,
  Paper,
  Space,
  Text,
  Title,
} from "@mantine/core";
import { useModals } from "@mantine/modals";
import { useEffect, useState } from "react";
import { TbLink, TbPlus, TbSettings, TbUsers } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import Meta from "../../components/Meta";
import ManageUserTable from "../../components/admin/users/ManageUserTable";
import showCreateUserModal from "../../components/admin/users/showCreateUserModal";
import DriveWorkspace from "../../components/layout/DriveWorkspace";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import userService from "../../services/user.service";
import User from "../../types/user.type";
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

const Users = () => {
  const { classes } = useStyles();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const config = useConfig();
  const modals = useModals();
  const t = useTranslate();

  const getUsers = () => {
    setIsLoading(true);
    userService.list().then((users) => {
      setUsers(users);
      setIsLoading(false);
    });
  };

  const deleteUser = (user: User) => {
    modals.openConfirmModal({
      title: t("admin.users.edit.delete.title", {
        username: user.username,
      }),
      children: (
        <Text size="sm">
          <FormattedMessage id="admin.users.edit.delete.description" />
        </Text>
      ),
      labels: {
        confirm: t("common.button.delete"),
        cancel: t("common.button.cancel"),
      },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        userService
          .remove(user.id)
          .then(() => setUsers(users.filter((v) => v.id != user.id)))
          .catch(toast.axiosError);
      },
    });
  };

  useEffect(() => {
    getUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return [
      user.username,
      user.email,
      user.isAdmin ? "管理员 admin" : "普通用户 user",
      user.isLdap ? "ldap" : "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return (
    <DriveWorkspace
      section="管理后台"
      sectionHref="/admin/users"
      title={<FormattedMessage id="admin.users.title" />}
      activePath="/admin/users"
      searchPlaceholder="在用户中搜索"
      searchValue={search}
      onSearchChange={setSearch}
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
      action={
        <Button
          onClick={() =>
            showCreateUserModal(modals, config.get("smtp.enabled"), getUsers)
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
      <Meta title={t("admin.users.title")} />
      <Group className={classes.header} position="apart" align="baseline">
        <Title mb={30} order={3}>
          <FormattedMessage id="admin.users.title" />
        </Title>
      </Group>
      <Paper className={classes.tablePanel}>
        <Box p={22}>
          <Text weight={900} size="lg">
            共 {filteredUsers.length} 项
          </Text>
        </Box>
        <ManageUserTable
          users={filteredUsers}
          getUsers={getUsers}
          deleteUser={deleteUser}
          isLoading={isLoading}
        />
      </Paper>
      <Space h="xl" />
    </DriveWorkspace>
  );
};

export default Users;
