import {
  ActionIcon,
  Box,
  Button,
  createStyles,
  Divider,
  Group,
  Image,
  Popover,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import {
  TbBell,
  TbCheck,
  TbCircle,
  TbHelpCircle,
  TbSearch,
  TbSettings,
  TbX,
} from "react-icons/tb";
import useUser from "../../hooks/user.hook";
import notificationHistory, {
  NotificationHistoryItem,
} from "../../utils/notificationHistory.util";

type NavItem = {
  href: string;
  icon: ReactNode;
  label: ReactNode;
};

const useStyles = createStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "220px minmax(0, 1fr)",
    background: "#ffffff",
    color: "#191919",

    [theme.fn.smallerThan("sm")]: {
      gridTemplateColumns: "1fr",
    },
  },

  sidebar: {
    minHeight: "100vh",
    background: "#f6f6f6",
    padding: "28px 20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRight: "1px solid #eeeeee",

    [theme.fn.smallerThan("sm")]: {
      minHeight: "auto",
      padding: "18px 16px",
    },
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#111111",
    textDecoration: "none",
    fontWeight: 900,
    fontSize: 22,
    lineHeight: 1.05,
  },

  nav: {
    marginTop: 110,

    [theme.fn.smallerThan("sm")]: {
      marginTop: 22,
      display: "flex",
      gap: 8,
      overflowX: "auto",
    },
  },

  navItem: {
    height: 52,
    padding: "0 18px",
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    gap: 14,
    color: "#8a8a8a",
    textDecoration: "none",
    fontWeight: 800,
    transition: "background 160ms ease, color 160ms ease, transform 160ms ease",

    "&:hover": {
      color: "#111111",
      background: "#ffffff",
      transform: "translateX(2px)",
      textDecoration: "none",
    },

    [theme.fn.smallerThan("sm")]: {
      flex: "0 0 auto",
      height: 44,
      borderRadius: 14,
    },
  },

  activeNavItem: {
    background: "#ffffff",
    color: "#111111",
    boxShadow: "0 10px 24px rgba(0, 0, 0, 0.04)",
  },

  storage: {
    color: "#9b9b9b",
    fontWeight: 800,
    fontSize: 13,

    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  storageBar: {
    height: 4,
    borderRadius: 999,
    background: "#dddddd",
    overflow: "hidden",
    marginTop: 12,
    marginBottom: 18,
  },

  storageFill: {
    width: "18%",
    height: "100%",
    background: "#ffd84d",
  },

  renewButton: {
    width: 70,
    height: 44,
    borderRadius: 18,
    background: "#ffffff",
    color: "#171717",
    fontWeight: 900,
    boxShadow: "0 8px 18px rgba(0, 0, 0, 0.05)",
    "&:hover": {
      background: "#fff3bd",
    },
  },

  main: {
    minWidth: 0,
    padding: "26px 32px 46px",

    [theme.fn.smallerThan("sm")]: {
      padding: "18px 16px 34px",
    },
  },

  toolbar: {
    minHeight: 58,
    marginBottom: 28,
  },

  breadcrumb: {
    color: "#9b9b9b",
    fontWeight: 900,
    fontSize: 18,
  },

  breadcrumbLink: {
    color: "#9b9b9b",
    textDecoration: "none",
    cursor: "pointer",
    transition: "color 160ms ease, transform 160ms ease",

    "&:hover": {
      color: "#111111",
      transform: "translateX(1px)",
      textDecoration: "none",
    },
  },

  title: {
    color: "#111111",
    fontWeight: 900,
  },

  search: {
    width: "min(420px, 34vw)",

    [theme.fn.smallerThan("md")]: {
      display: "none",
    },
  },

  searchInput: {
    input: {
      height: 48,
      border: 0,
      borderRadius: 0,
      background: "#f6f6f6",
      color: "#111111",
      fontWeight: 800,

      "&::placeholder": {
        color: "#9a9a9a",
      },
    },
  },

  yellowButton: {
    height: 48,
    padding: "0 28px",
    borderRadius: 24,
    background: "#ffd84d",
    color: "#111111",
    fontWeight: 900,
    boxShadow: "0 10px 20px rgba(255, 216, 77, 0.32)",
    "&:hover": {
      background: "#ffdf68",
    },
  },

  iconButton: {
    color: "#111111",

    "&:hover": {
      background: "#fff3bd",
    },
  },

  disabledIconButton: {
    color: "#c7c7c7",
    cursor: "not-allowed",
    "&:hover": {
      background: "transparent",
    },
  },

  notificationPanel: {
    borderRadius: 18,
    boxShadow: "0 18px 44px rgba(0, 0, 0, 0.12)",
  },

  notificationItem: {
    padding: "12px 0",
  },

  notificationDot: {
    flex: "0 0 auto",
  },

  clearButton: {
    color: "#777777",
    fontWeight: 800,
    "&:hover": {
      color: "#111111",
      background: "#fff3bd",
    },
  },

  content: {
    minHeight: "calc(100vh - 130px)",
  },
}));

const DriveWorkspace = ({
  title,
  section,
  sectionHref,
  navItems,
  activePath,
  action,
  children,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  sidebarFooter,
}: {
  title: ReactNode;
  section: ReactNode;
  sectionHref?: string;
  navItems: NavItem[];
  activePath: string;
  action?: ReactNode;
  children: ReactNode;
  searchPlaceholder?: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  sidebarFooter?: ReactNode;
}) => {
  const { classes, cx } = useStyles();
  const router = useRouter();
  const { user } = useUser();
  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>(
    [],
  );

  useEffect(() => {
    const refreshNotifications = () =>
      setNotifications(notificationHistory.list());

    refreshNotifications();
    window.addEventListener(
      notificationHistory.eventName,
      refreshNotifications,
    );

    return () =>
      window.removeEventListener(
        notificationHistory.eventName,
        refreshNotifications,
      );
  }, []);

  const openHelp = () => void router.push("/help");
  const openSettings = () => {
    if (user?.isAdmin) void router.push("/admin/config/general");
  };
  const exitWorkspace = () => void router.push("/upload");

  const clearNotifications = () => {
    notificationHistory.clear();
    setNotifications([]);
  };

  return (
    <Box className={classes.root}>
      <aside className={classes.sidebar}>
        <Box>
          <Box component={Link} href="/upload" className={classes.logo}>
            <Image src="/img/logo.png" width={42} height={42} alt="logo" />
            <Box>
              <Text inherit>星闪</Text>
              <Text inherit>快传</Text>
            </Box>
          </Box>
          <Box className={classes.nav}>
            {navItems.map((item) => (
              <Box
                component={Link}
                href={item.href}
                key={item.href}
                className={cx(classes.navItem, {
                  [classes.activeNavItem]: activePath === item.href,
                })}
              >
                {item.icon}
                <Text>{item.label}</Text>
              </Box>
            ))}
          </Box>
        </Box>
        {sidebarFooter ?? (
          <Box className={classes.storage}>
            <Text>我的：266.06 MB / 3.00 TB</Text>
            <Box className={classes.storageBar}>
              <Box className={classes.storageFill} />
            </Box>
            <Button className={classes.renewButton}>续费</Button>
          </Box>
        )}
      </aside>
      <main className={classes.main}>
        <Group className={classes.toolbar} position="apart" noWrap>
          <Group spacing={8} noWrap>
            {sectionHref ? (
              <Text
                component={Link}
                href={sectionHref}
                className={cx(classes.breadcrumb, classes.breadcrumbLink)}
              >
                {section}
              </Text>
            ) : (
              <Text className={classes.breadcrumb}>{section}</Text>
            )}
            <Text className={classes.breadcrumb}>›</Text>
            <Text className={classes.title}>{title}</Text>
          </Group>
          <Group spacing={18} noWrap>
            <TextInput
              className={cx(classes.search, classes.searchInput)}
              icon={<TbSearch size={22} />}
              placeholder={String(searchPlaceholder ?? "在我的闪包内搜索")}
              value={searchValue ?? ""}
              onChange={(event) => onSearchChange?.(event.currentTarget.value)}
              disabled={!onSearchChange}
            />
            {action === undefined ? (
              <Button className={classes.yellowButton}>+ 新建</Button>
            ) : (
              action
            )}
            <ActionIcon
              className={classes.iconButton}
              size="lg"
              onClick={openHelp}
              title="帮助文档"
            >
              <TbHelpCircle size={24} />
            </ActionIcon>
            <Popover width={340} position="bottom-end" shadow="xl" withinPortal>
              <Popover.Target>
                <ActionIcon
                  className={classes.iconButton}
                  size="lg"
                  title="通知消息"
                >
                  <TbBell size={22} />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown className={classes.notificationPanel}>
                <Group position="apart" mb="sm">
                  <Text weight={900}>通知消息</Text>
                  {notifications.length > 0 && (
                    <Button
                      compact
                      variant="subtle"
                      className={classes.clearButton}
                      onClick={clearNotifications}
                    >
                      清空
                    </Button>
                  )}
                </Group>
                <Divider />
                {notifications.length === 0 ? (
                  <Text color="dimmed" weight={700} py="md">
                    暂无通知消息
                  </Text>
                ) : (
                  <ScrollArea h={260} type="auto">
                    <Stack spacing={0}>
                      {notifications.map((notification) => (
                        <Group
                          key={notification.id}
                          className={classes.notificationItem}
                          align="flex-start"
                          noWrap
                        >
                          {notification.type === "success" ? (
                            <TbCheck
                              className={classes.notificationDot}
                              color="#2f9e44"
                              size={18}
                            />
                          ) : (
                            <TbCircle
                              className={classes.notificationDot}
                              color={
                                notification.type === "error"
                                  ? "#e03131"
                                  : "#ffd84d"
                              }
                              size={12}
                            />
                          )}
                          <Box>
                            <Text weight={900}>{notification.title}</Text>
                            <Text size="sm" color="dimmed" weight={700}>
                              {notification.message}
                            </Text>
                            <Text size="xs" color="dimmed" mt={4}>
                              {new Date(
                                notification.createdAt,
                              ).toLocaleString()}
                            </Text>
                          </Box>
                        </Group>
                      ))}
                    </Stack>
                  </ScrollArea>
                )}
              </Popover.Dropdown>
            </Popover>
            <Tooltip
              label={user?.isAdmin ? "设置" : "只有管理员可以打开系统设置"}
              withArrow
            >
              <ActionIcon
                className={cx(classes.iconButton, {
                  [classes.disabledIconButton]: !user?.isAdmin,
                })}
                size="lg"
                onClick={openSettings}
                title="设置"
                aria-disabled={!user?.isAdmin}
              >
                <TbSettings size={22} />
              </ActionIcon>
            </Tooltip>
            <ActionIcon
              className={classes.iconButton}
              size="lg"
              onClick={exitWorkspace}
              title="退出到首页"
            >
              <TbX size={24} />
            </ActionIcon>
          </Group>
        </Group>
        <Box className={classes.content}>{children}</Box>
      </main>
    </Box>
  );
};

export default DriveWorkspace;
