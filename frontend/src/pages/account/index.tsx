import {
  ActionIcon,
  Badge,
  Box,
  Button,
  createStyles,
  Divider,
  Group,
  Paper,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { useModals } from "@mantine/modals";
import { useEffect, useState } from "react";
import {
  TbAuth2Fa,
  TbCloud,
  TbEdit,
  TbHistory,
  TbInfoCircle,
  TbKey,
  TbLink,
  TbLock,
  TbShieldCheck,
  TbTrash,
  TbUser,
} from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import * as yup from "yup";
import Meta from "../../components/Meta";
import showEnableTotpModal from "../../components/account/showEnableTotpModal";
import DriveWorkspace from "../../components/layout/DriveWorkspace";
import useTranslate from "../../hooks/useTranslate.hook";
import useUser from "../../hooks/user.hook";
import authService from "../../services/auth.service";
import userService from "../../services/user.service";
import { getOAuthIcon, getOAuthUrl, unlinkOAuth } from "../../utils/oauth.util";
import toast from "../../utils/toast.util";

const useStyles = createStyles((theme) => ({
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(380px, 420px) minmax(0, 1fr)",
    gap: 24,
    alignItems: "start",

    [theme.fn.smallerThan("lg")]: {
      gridTemplateColumns: "360px minmax(0, 1fr)",
    },

    [theme.fn.smallerThan("md")]: {
      gridTemplateColumns: "1fr",
    },
  },

  panel: {
    border: "1px solid #eeeeee",
    borderRadius: 22,
    boxShadow: "0 12px 34px rgba(0, 0, 0, 0.05)",
    background: "#ffffff",
    overflow: "hidden",
  },

  summaryPanel: {
    position: "sticky",
    top: 24,

    [theme.fn.smallerThan("md")]: {
      position: "static",
    },
  },

  summaryHeader: {
    padding: 28,
    background:
      "linear-gradient(135deg, #111111 0%, #2b2b2b 58%, #ffd84d 58%, #ffd84d 100%)",
    borderBottom: "1px solid #eeeeee",
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 24,
    display: "grid",
    placeItems: "center",
    background: "#ffffff",
    color: "#111111",
    boxShadow: "0 14px 30px rgba(0, 0, 0, 0.18)",
  },

  summaryBody: {
    padding: 24,
  },

  summaryName: {
    color: "#ffffff",
    fontWeight: 900,
    lineHeight: 1.08,
  },

  summaryEmail: {
    maxWidth: 220,
    color: "rgba(255, 255, 255, 0.74)",
    fontWeight: 800,
  },

  metric: {
    minHeight: 108,
    padding: 16,
    borderRadius: 16,
    background: "#f7f7f7",
    alignContent: "space-between",
  },

  metricIcon: {
    color: "#111111",
    background: "#ffffff",
    border: "1px solid #eeeeee",

    "&:hover": {
      background: "#fff3bd",
    },
  },

  metricValue: {
    marginTop: 12,
    fontSize: 18,
    lineHeight: 1.15,
    fontWeight: 900,
    color: "#111111",
  },

  sectionHeader: {
    padding: "20px 22px",
    borderBottom: "1px solid #eeeeee",
  },

  sectionBody: {
    padding: 22,
  },

  panelTitle: {
    fontWeight: 900,
    color: "#111111",
  },

  muted: {
    color: "#8a8a8a",
    fontWeight: 800,
  },

  input: {
    input: {
      minHeight: 46,
      borderRadius: 12,
      fontWeight: 700,
    },
  },

  saveButton: {
    minWidth: 108,
    height: 42,
    borderRadius: 14,
    background: "#111111",
    color: "#ffffff",
    fontWeight: 900,

    "&:hover": {
      background: "#2a2a2a",
    },
  },

  lightButton: {
    minWidth: 108,
    height: 42,
    borderRadius: 14,
    fontWeight: 900,
  },

  settingList: {
    display: "grid",
    gap: 12,
  },

  settingRow: {
    minHeight: 78,
    padding: "16px 18px",
    borderRadius: 18,
    background: "#fafafa",
    border: "1px solid #f0f0f0",
    transition: "border-color 160ms ease, background 160ms ease",

    "&:hover": {
      background: "#ffffff",
      borderColor: "#e2e2e2",
    },
  },

  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "#ffffff",
    color: "#111111",
    border: "1px solid #eeeeee",
  },

  valuePill: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 34,
    padding: "0 12px",
    borderRadius: 999,
    background: "#ffffff",
    border: "1px solid #eeeeee",
    color: "#111111",
    fontWeight: 900,
  },

  inlineValue: {
    maxWidth: 260,
    color: "#111111",
    fontWeight: 900,
  },

  danger: {
    borderRadius: 14,
    fontWeight: 900,
  },

  emptyState: {
    padding: "34px 22px",
    border: "1px dashed #dddddd",
    borderRadius: 18,
    background: "#fafafa",
  },
}));

const Account = () => {
  const { classes } = useStyles();
  const [oauth, setOAuth] = useState<string[]>([]);
  const [oauthStatus, setOAuthStatus] = useState<Record<
    string,
    {
      provider: string;
      providerUsername: string;
    }
  > | null>(null);
  const [search, setSearch] = useState("");

  const { user, refreshUser } = useUser();
  const modals = useModals();
  const t = useTranslate();

  const accountForm = useForm({
    initialValues: {
      username: user?.username,
      email: user?.email,
    },
    validate: yupResolver(
      yup.object().shape({
        email: yup.string().email(t("common.error.invalid-email")),
        username: yup
          .string()
          .min(3, t("common.error.too-short", { length: 3 })),
      }),
    ),
  });

  const passwordForm = useForm({
    initialValues: {
      oldPassword: "",
      password: "",
    },
    validate: yupResolver(
      yup.object().shape({
        oldPassword: yup.string().when([], {
          is: () => !!user?.hasPassword,
          then: (schema) =>
            schema
              .min(8, t("common.error.too-short", { length: 8 }))
              .required(t("common.error.field-required")),
          otherwise: (schema) => schema.notRequired(),
        }),
        password: yup
          .string()
          .min(8, t("common.error.too-short", { length: 8 }))
          .required(t("common.error.field-required")),
      }),
    ),
  });

  const enableTotpForm = useForm({
    initialValues: {
      password: "",
    },
    validate: yupResolver(
      yup.object().shape({
        password: yup
          .string()
          .min(8, t("common.error.too-short", { length: 8 }))
          .required(t("common.error.field-required")),
      }),
    ),
  });

  const disableTotpForm = useForm({
    initialValues: {
      password: "",
      code: "",
    },
    validate: yupResolver(
      yup.object().shape({
        password: yup.string().min(8),
        code: yup
          .string()
          .min(6, t("common.error.exact-length", { length: 6 }))
          .max(6, t("common.error.exact-length", { length: 6 }))
          .matches(/^[0-9]+$/, { message: t("common.error.invalid-number") }),
      }),
    ),
  });

  const refreshOAuthStatus = () => {
    authService
      .getOAuthStatus()
      .then((data) => {
        setOAuthStatus(data.data);
      })
      .catch(toast.axiosError);
  };

  useEffect(() => {
    authService
      .getAvailableOAuth()
      .then((data) => {
        setOAuth(data.data);
      })
      .catch(toast.axiosError);
    refreshOAuthStatus();
  }, []);

  useEffect(() => {
    accountForm.setValues({
      username: user?.username,
      email: user?.email,
    });
  }, [user?.email, user?.username]);

  const matchesSearch = (values: string[]) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return values.join(" ").toLowerCase().includes(query);
  };

  const showInfoCard = matchesSearch([
    "账号",
    "账户",
    "信息",
    "邮箱",
    "用户名",
  ]);
  const showPasswordCard = matchesSearch(["密码", "修改密码", "password"]);
  const showOAuthCard = matchesSearch(["oauth", "第三方登录", ...oauth]);
  const showSecurityCard = matchesSearch(["安全", "totp", "二次验证"]);
  const showDeleteCard = matchesSearch(["删除", "注销", "危险"]);
  const visibleSections = [
    showInfoCard,
    !user?.isLdap && showPasswordCard,
    oauth.length > 0 && showOAuthCard,
    showSecurityCard,
    showDeleteCard,
  ].filter(Boolean).length;

  const accountStatus = user?.isLdap ? "LDAP" : "本地账户";
  const passwordStatus = user?.hasPassword ? "已设置" : "未设置";
  const securityStatus = user?.totpVerified ? "已开启" : "未开启";
  const linkedOAuthCount = oauthStatus ? Object.keys(oauthStatus).length : 0;

  const openAccountInfoModal = () => {
    accountForm.setValues({
      username: user?.username,
      email: user?.email,
    });

    let modalId = "";
    modalId = modals.openModal({
      title: t("account.card.info.title"),
      children: (
        <form
          onSubmit={accountForm.onSubmit((values) =>
            userService
              .updateCurrentUser({
                username: values.username,
                email: values.email,
              })
              .then(async () => {
                await refreshUser();
                toast.success(t("account.notify.info.success"));
                modals.closeModal(modalId);
              })
              .catch(toast.axiosError),
          )}
        >
          <Stack>
            <TextInput
              className={classes.input}
              label={t("account.card.info.username")}
              {...accountForm.getInputProps("username")}
            />
            <TextInput
              className={classes.input}
              label={t("account.card.info.email")}
              {...accountForm.getInputProps("email")}
            />
            <Group position="right">
              <Button
                className={classes.lightButton}
                variant="subtle"
                onClick={() => modals.closeModal(modalId)}
              >
                <FormattedMessage id="common.button.cancel" />
              </Button>
              <Button className={classes.saveButton} type="submit">
                <FormattedMessage id="common.button.save" />
              </Button>
            </Group>
          </Stack>
        </form>
      ),
    });
  };

  const openPasswordModal = () => {
    passwordForm.reset();

    let modalId = "";
    modalId = modals.openModal({
      title: t("account.card.password.title"),
      children: (
        <form
          onSubmit={passwordForm.onSubmit((values) =>
            authService
              .updatePassword(values.oldPassword, values.password)
              .then(async () => {
                await refreshUser();
                toast.success(t("account.notify.password.success"));
                passwordForm.reset();
                modals.closeModal(modalId);
              })
              .catch(toast.axiosError),
          )}
        >
          <Stack>
            {user?.hasPassword ? (
              <PasswordInput
                className={classes.input}
                label={t("account.card.password.old")}
                {...passwordForm.getInputProps("oldPassword")}
              />
            ) : (
              <Text size="sm" color="dimmed" weight={700}>
                <FormattedMessage id="account.card.password.noPasswordSet" />
              </Text>
            )}
            <PasswordInput
              className={classes.input}
              label={t("account.card.password.new")}
              {...passwordForm.getInputProps("password")}
            />
            <Group position="right">
              <Button
                className={classes.lightButton}
                variant="subtle"
                onClick={() => modals.closeModal(modalId)}
              >
                <FormattedMessage id="common.button.cancel" />
              </Button>
              <Button className={classes.saveButton} type="submit">
                <FormattedMessage id="common.button.save" />
              </Button>
            </Group>
          </Stack>
        </form>
      ),
    });
  };

  const openEnableTotpModal = () => {
    enableTotpForm.reset();

    let modalId = "";
    modalId = modals.openModal({
      title: t("account.card.security.totp.button.start"),
      children: (
        <form
          onSubmit={enableTotpForm.onSubmit((values) => {
            authService
              .enableTOTP(values.password)
              .then((result) => {
                modals.closeModal(modalId);
                showEnableTotpModal(modals, refreshUser, {
                  qrCode: result.qrCode,
                  secret: result.totpSecret,
                  password: values.password,
                });
                enableTotpForm.reset();
              })
              .catch(toast.axiosError);
          })}
        >
          <Stack>
            <PasswordInput
              className={classes.input}
              label={t("account.card.password.title")}
              description={t("account.card.security.totp.enable.description")}
              {...enableTotpForm.getInputProps("password")}
            />
            <Group position="right">
              <Button
                className={classes.lightButton}
                variant="subtle"
                onClick={() => modals.closeModal(modalId)}
              >
                <FormattedMessage id="common.button.cancel" />
              </Button>
              <Button className={classes.saveButton} type="submit">
                <FormattedMessage id="account.card.security.totp.button.start" />
              </Button>
            </Group>
          </Stack>
        </form>
      ),
    });
  };

  const openDisableTotpModal = () => {
    disableTotpForm.reset();

    let modalId = "";
    modalId = modals.openModal({
      title: t("common.button.disable"),
      children: (
        <form
          onSubmit={disableTotpForm.onSubmit((values) => {
            authService
              .disableTOTP(values.code, values.password)
              .then(() => {
                toast.success(t("account.notify.totp.disable"));
                disableTotpForm.reset();
                refreshUser();
                modals.closeModal(modalId);
              })
              .catch(toast.axiosError);
          })}
        >
          <Stack>
            <PasswordInput
              className={classes.input}
              description={t("account.card.security.totp.disable.description")}
              label={t("account.card.password.title")}
              {...disableTotpForm.getInputProps("password")}
            />
            <TextInput
              className={classes.input}
              variant="filled"
              label={t("account.modal.totp.code")}
              placeholder="******"
              {...disableTotpForm.getInputProps("code")}
            />
            <Group position="right">
              <Button
                className={classes.lightButton}
                variant="subtle"
                onClick={() => modals.closeModal(modalId)}
              >
                <FormattedMessage id="common.button.cancel" />
              </Button>
              <Button className={classes.danger} color="red" type="submit">
                <FormattedMessage id="common.button.disable" />
              </Button>
            </Group>
          </Stack>
        </form>
      ),
    });
  };

  return (
    <DriveWorkspace
      section="我的闪包"
      sectionHref="/account/shares"
      title={<FormattedMessage id="account.title" />}
      activePath="/account"
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
      action={null}
    >
      <Meta title={t("account.title")} />
      <Box className={classes.layout}>
        <Paper className={`${classes.panel} ${classes.summaryPanel}`}>
          <Box className={classes.summaryHeader}>
            <Group align="center" noWrap>
              <Box className={classes.avatar}>
                <TbUser size={34} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Group spacing={8} noWrap>
                  <Title className={classes.summaryName} order={2}>
                    {user?.username ?? "Account"}
                  </Title>
                  {user?.isLdap ? (
                    <Badge color="dark" variant="filled">
                      LDAP
                    </Badge>
                  ) : null}
                </Group>
                <Text className={classes.summaryEmail} truncate>
                  {user?.email}
                </Text>
              </Box>
            </Group>
          </Box>

          <SimpleGrid
            className={classes.summaryBody}
            cols={2}
            spacing={14}
            breakpoints={[{ maxWidth: "xs", cols: 1 }]}
          >
            <Box className={classes.metric}>
              <Group position="apart" noWrap>
                <Text size="xs" className={classes.muted}>
                  账户类型
                </Text>
                <Tooltip label="账户信息">
                  <ActionIcon className={classes.metricIcon} size={36}>
                    <TbUser size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              <Text className={classes.metricValue}>{accountStatus}</Text>
            </Box>
            <Box className={classes.metric}>
              <Group position="apart" noWrap>
                <Text size="xs" className={classes.muted}>
                  密码
                </Text>
                <Tooltip label="密码状态">
                  <ActionIcon className={classes.metricIcon} size={36}>
                    <TbKey size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              <Text className={classes.metricValue}>{passwordStatus}</Text>
            </Box>
            <Box className={classes.metric}>
              <Group position="apart" noWrap>
                <Text size="xs" className={classes.muted}>
                  二步验证
                </Text>
                <Tooltip label="安全状态">
                  <ActionIcon className={classes.metricIcon} size={36}>
                    <TbShieldCheck size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              <Text className={classes.metricValue}>{securityStatus}</Text>
            </Box>
            {oauth.length > 0 && (
              <Box className={classes.metric}>
                <Group position="apart" noWrap>
                  <Text size="xs" className={classes.muted}>
                    第三方登录
                  </Text>
                  <Tooltip label="社交账号登录">
                    <ActionIcon className={classes.metricIcon} size={36}>
                      <TbLink size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <Text className={classes.metricValue}>
                  {linkedOAuthCount} / {oauth.length}
                </Text>
              </Box>
            )}
          </SimpleGrid>
        </Paper>

        <Stack spacing={22}>
          <Group position="apart" align="baseline">
            <Box>
              <Title order={3} className={classes.panelTitle}>
                <FormattedMessage id="account.title" />
              </Title>
              <Text className={classes.muted}>共 {visibleSections} 项设置</Text>
            </Box>
          </Group>

          {showInfoCard && (
            <Paper className={classes.panel}>
              <Group className={classes.sectionHeader} position="apart">
                <Box>
                  <Title className={classes.panelTitle} order={4}>
                    <FormattedMessage id="account.card.info.title" />
                  </Title>
                  <Text className={classes.muted} size="sm">
                    管理用户名和电子邮件
                  </Text>
                </Box>
                <TbUser size={24} color="#111111" />
              </Group>
              <Box className={classes.sectionBody}>
                <Stack className={classes.settingList}>
                  <Group className={classes.settingRow} position="apart" noWrap>
                    <Group spacing={14} noWrap>
                      <Box className={classes.settingIcon}>
                        <TbUser size={20} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Text className={classes.muted} size="sm">
                          {t("account.card.info.username")}
                        </Text>
                        <Text className={classes.inlineValue} truncate>
                          {user?.username}
                        </Text>
                      </Box>
                    </Group>
                    {user?.isLdap ? (
                      <Badge variant="light">LDAP</Badge>
                    ) : (
                      <Button
                        className={classes.lightButton}
                        variant="light"
                        leftIcon={<TbEdit size={16} />}
                        onClick={openAccountInfoModal}
                      >
                        编辑
                      </Button>
                    )}
                  </Group>
                  <Group className={classes.settingRow} position="apart" noWrap>
                    <Group spacing={14} noWrap>
                      <Box className={classes.settingIcon}>
                        <TbInfoCircle size={20} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Text className={classes.muted} size="sm">
                          {t("account.card.info.email")}
                        </Text>
                        <Text className={classes.inlineValue} truncate>
                          {user?.email}
                        </Text>
                      </Box>
                    </Group>
                    <Text className={classes.valuePill}>{accountStatus}</Text>
                  </Group>
                </Stack>
              </Box>
            </Paper>
          )}

          {!user?.isLdap && showPasswordCard && (
            <Paper className={classes.panel}>
              <Group className={classes.sectionHeader} position="apart">
                <Box>
                  <Title className={classes.panelTitle} order={4}>
                    <FormattedMessage id="account.card.password.title" />
                  </Title>
                  <Text className={classes.muted} size="sm">
                    更新用于登录的账户密码
                  </Text>
                </Box>
                <TbLock size={24} color="#111111" />
              </Group>
              <Box className={classes.sectionBody}>
                <Group className={classes.settingRow} position="apart" noWrap>
                  <Group spacing={14} noWrap>
                    <Box className={classes.settingIcon}>
                      <TbKey size={20} />
                    </Box>
                    <Box>
                      <Text className={classes.muted} size="sm">
                        密码状态
                      </Text>
                      <Text className={classes.valuePill}>
                        {passwordStatus}
                      </Text>
                    </Box>
                  </Group>
                  <Button
                    className={classes.lightButton}
                    variant="light"
                    leftIcon={<TbEdit size={16} />}
                    onClick={openPasswordModal}
                  >
                    更改
                  </Button>
                </Group>
              </Box>
            </Paper>
          )}

          {oauth.length > 0 && showOAuthCard && (
            <Paper className={classes.panel}>
              <Group className={classes.sectionHeader} position="apart">
                <Box>
                  <Title className={classes.panelTitle} order={4}>
                    <FormattedMessage id="account.card.oauth.title" />
                  </Title>
                  <Text className={classes.muted} size="sm">
                    管理可用于登录的第三方账号
                  </Text>
                </Box>
                <TbLink size={24} color="#111111" />
              </Group>
              <Box className={classes.sectionBody}>
                <Stack className={classes.settingList}>
                  {oauth.map((provider) => (
                    <Group
                      className={classes.settingRow}
                      position="apart"
                      noWrap
                      key={provider}
                    >
                      <Group spacing={14} noWrap>
                        <Box className={classes.settingIcon}>
                          {getOAuthIcon(provider)}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Text weight={900}>
                            {t(`account.card.oauth.${provider}`)}
                          </Text>
                          <Text className={classes.muted} size="sm" truncate>
                            {oauthStatus?.[provider]
                              ? oauthStatus[provider].providerUsername
                              : t("account.card.oauth.unlinked")}
                          </Text>
                        </Box>
                      </Group>
                      {oauthStatus?.[provider] ? (
                        <Button
                          className={classes.lightButton}
                          variant="subtle"
                          color="red"
                          onClick={() => {
                            modals.openConfirmModal({
                              title: t("account.modal.unlink.title"),
                              children: (
                                <Text>
                                  {t("account.modal.unlink.description")}
                                </Text>
                              ),
                              labels: {
                                confirm: t("account.card.oauth.unlink"),
                                cancel: t("common.button.cancel"),
                              },
                              confirmProps: { color: "red" },
                              onConfirm: () => {
                                unlinkOAuth(provider)
                                  .then(() => {
                                    toast.success(
                                      t(
                                        "account.notify.oauth.unlinked.success",
                                      ),
                                    );
                                    refreshOAuthStatus();
                                  })
                                  .catch(toast.axiosError);
                              },
                            });
                          }}
                        >
                          {t("account.card.oauth.unlink")}
                        </Button>
                      ) : (
                        <Button
                          className={classes.saveButton}
                          component="a"
                          href={getOAuthUrl(
                            typeof window !== "undefined"
                              ? window.location.origin
                              : "",
                            provider,
                          )}
                        >
                          {t("account.card.oauth.link")}
                        </Button>
                      )}
                    </Group>
                  ))}
                </Stack>
              </Box>
            </Paper>
          )}

          {showSecurityCard && (
            <Paper className={classes.panel}>
              <Group className={classes.sectionHeader} position="apart">
                <Box>
                  <Title className={classes.panelTitle} order={4}>
                    <FormattedMessage id="account.card.security.title" />
                  </Title>
                  <Text className={classes.muted} size="sm">
                    控制账户的额外验证方式
                  </Text>
                </Box>
                <TbShieldCheck size={24} color="#111111" />
              </Group>
              <Box className={classes.sectionBody}>
                <Group className={classes.settingRow} position="apart" noWrap>
                  <Group spacing={14} noWrap>
                    <Box className={classes.settingIcon}>
                      <TbAuth2Fa size={20} />
                    </Box>
                    <Box>
                      <Text weight={900}>TOTP</Text>
                      <Text className={classes.muted} size="sm">
                        {user?.totpVerified
                          ? "登录时需要一次性验证码"
                          : "为账户增加一次性验证码保护"}
                      </Text>
                    </Box>
                  </Group>
                  {user?.totpVerified ? (
                    <Button
                      className={classes.danger}
                      color="red"
                      variant="light"
                      onClick={openDisableTotpModal}
                    >
                      <FormattedMessage id="common.button.disable" />
                    </Button>
                  ) : (
                    <Button
                      className={classes.saveButton}
                      onClick={openEnableTotpModal}
                    >
                      <FormattedMessage id="account.card.security.totp.button.start" />
                    </Button>
                  )}
                </Group>
              </Box>
            </Paper>
          )}

          {showDeleteCard && (
            <Paper className={classes.panel}>
              <Group className={classes.sectionHeader} position="apart">
                <Box>
                  <Title className={classes.panelTitle} order={4}>
                    危险操作
                  </Title>
                  <Text className={classes.muted} size="sm">
                    删除账户会同时删除所有共享
                  </Text>
                </Box>
                <TbTrash size={24} color="#e03131" />
              </Group>
              <Box className={classes.sectionBody}>
                <Group className={classes.settingRow} position="apart" noWrap>
                  <Group spacing={14} noWrap>
                    <Box className={classes.settingIcon}>
                      <TbTrash size={20} color="#e03131" />
                    </Box>
                    <Box>
                      <Text weight={900}>
                        <FormattedMessage id="account.button.delete" />
                      </Text>
                      <Text className={classes.muted} size="sm">
                        <FormattedMessage id="account.modal.delete.description" />
                      </Text>
                    </Box>
                  </Group>
                  <Button
                    className={classes.danger}
                    variant="light"
                    color="red"
                    onClick={() =>
                      modals.openConfirmModal({
                        title: t("account.modal.delete.title"),
                        children: (
                          <Text size="sm">
                            <FormattedMessage id="account.modal.delete.description" />
                          </Text>
                        ),
                        labels: {
                          confirm: t("common.button.delete"),
                          cancel: t("common.button.cancel"),
                        },
                        confirmProps: { color: "red" },
                        onConfirm: async () => {
                          await userService
                            .removeCurrentUser()
                            .then(() => window.location.reload())
                            .catch(toast.axiosError);
                        },
                      })
                    }
                  >
                    <FormattedMessage id="account.button.delete" />
                  </Button>
                </Group>
              </Box>
            </Paper>
          )}

          {visibleSections === 0 && (
            <Box className={classes.emptyState}>
              <Text weight={900}>没有匹配的账户设置</Text>
              <Text className={classes.muted} size="sm">
                请尝试更换搜索关键词。
              </Text>
            </Box>
          )}
          <Divider color="#f0f0f0" />
        </Stack>
      </Box>
    </DriveWorkspace>
  );
};

export default Account;
