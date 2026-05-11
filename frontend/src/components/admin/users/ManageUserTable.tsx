import {
  ActionIcon,
  Badge,
  Box,
  createStyles,
  Group,
  Skeleton,
  Table,
} from "@mantine/core";
import { useModals } from "@mantine/modals";
import { TbCheck, TbEdit, TbTrash } from "react-icons/tb";
import User from "../../../types/user.type";
import showUpdateUserModal from "./showUpdateUserModal";
import { FormattedMessage } from "react-intl";

const useStyles = createStyles(() => ({
  table: {
    "thead tr th": {
      borderBottom: 0,
      color: "#777777",
      fontSize: 14,
      fontWeight: 900,
      padding: "16px 22px",
    },
    "tbody tr:hover": {
      background: "#fafafa",
    },
    "tbody tr td": {
      borderBottom: "1px solid #f0f0f0",
      padding: "18px 22px",
      color: "#222222",
      fontWeight: 700,
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
}));

const ManageUserTable = ({
  users,
  getUsers,
  deleteUser,
  isLoading,
}: {
  users: User[];
  getUsers: () => void;
  deleteUser: (user: User) => void;
  isLoading: boolean;
}) => {
  const { classes } = useStyles();
  const modals = useModals();

  return (
    <Box sx={{ display: "block", overflowX: "auto" }}>
      <Table className={classes.table} verticalSpacing="sm">
        <thead>
          <tr>
            <th>
              <FormattedMessage id="admin.users.table.username" />
            </th>
            <th>
              <FormattedMessage id="admin.users.table.email" />
            </th>
            <th>
              <FormattedMessage id="admin.users.table.admin" />
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? skeletonRows
            : users.map((user) => (
                <tr key={user.id}>
                  <td>
                    {user.username}{" "}
                    {user.isLdap ? (
                      <Badge style={{ marginLeft: "1em" }}>LDAP</Badge>
                    ) : null}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.isAdmin && <TbCheck />}</td>
                  <td>
                    <Group position="right">
                      {user.isLdap ? null : (
                        <ActionIcon
                          className={classes.actionIcon}
                          size={34}
                          onClick={() =>
                            showUpdateUserModal(modals, user, getUsers)
                          }
                        >
                          <TbEdit />
                        </ActionIcon>
                      )}
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size={34}
                        onClick={() => deleteUser(user)}
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
  );
};

const skeletonRows = [...Array(10)].map((v, i) => (
  <tr key={i}>
    <td>
      <Skeleton key={i} height={20} />
    </td>
    <td>
      <Skeleton key={i} height={20} />
    </td>
    <td>
      <Skeleton key={i} height={20} />
    </td>
    <td>
      <Skeleton key={i} height={20} />
    </td>
  </tr>
));

export default ManageUserTable;
