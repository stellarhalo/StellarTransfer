import {
  Anchor,
  Box,
  Button,
  createStyles,
  Group,
  Loader,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { TbInfoCircle } from "react-icons/tb";
import { FormattedMessage, useIntl } from "react-intl";
import * as yup from "yup";
import useConfig from "../../hooks/config.hook";
import useUser from "../../hooks/user.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import authService from "../../services/auth.service";
import { getOAuthIcon, getOAuthUrl } from "../../utils/oauth.util";
import { safeRedirectPath } from "../../utils/router.util";
import toast from "../../utils/toast.util";
import Logo from "../Logo";

const useStyles = createStyles((theme) => ({
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "minmax(280px, 38vw) 1fr",
    background: "#f7f2e8",
    color: "#171717",
    "@media (max-width: 820px)": {
      gridTemplateColumns: "1fr",
    },
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    padding: "34px",
    minHeight: "100vh",
    background:
      "linear-gradient(145deg, rgba(22, 21, 18, 0.22), rgba(22, 21, 18, 0.62)), radial-gradient(circle at 70% 14%, #f8dc59 0 14%, transparent 15%), linear-gradient(150deg, #d9c5a4 0%, #b98151 45%, #304b64 100%)",
    "@media (max-width: 820px)": {
      minHeight: 220,
      padding: "24px",
    },
  },
  logo: {
    position: "relative",
    zIndex: 2,
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    fontWeight: 800,
    color: "#fff",
    fontSize: 22,
  },
  logoMark: {
    width: 34,
    height: 34,
    display: "grid",
    placeItems: "center",
  },
  heroCopy: {
    position: "absolute",
    left: 34,
    right: 34,
    bottom: 146,
    zIndex: 2,
    color: "#fff",
    "@media (max-width: 820px)": {
      bottom: 34,
    },
  },
  main: {
    position: "relative",
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "96px 28px 42px",
    "@media (max-width: 820px)": {
      minHeight: "auto",
      padding: "34px 18px",
    },
  },
  nav: {
    position: "absolute",
    top: 24,
    right: 28,
    minHeight: 52,
    borderRadius: 28,
    background: "#fff",
    boxShadow: "0 12px 34px rgba(24, 25, 27, 0.08)",
    padding: "8px 10px",
    display: "flex",
    gap: 6,
    alignItems: "center",
    "@media (max-width: 620px)": {
      position: "static",
      justifySelf: "center",
      marginBottom: 18,
    },
  },
  navLink: {
    minWidth: 72,
    height: 36,
    borderRadius: 20,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#202124",
    fontSize: 14,
    fontWeight: 700,
  },
  card: {
    width: "min(440px, 100%)",
    borderRadius: 12,
    background: "#fff",
    border: "1px solid rgba(24, 25, 27, 0.08)",
    boxShadow: "0 24px 60px rgba(28, 30, 32, 0.12)",
    padding: "36px 34px 32px",
    "@media (max-width: 480px)": {
      padding: "28px 20px",
    },
  },
  input: {
    input: {
      minHeight: 48,
      borderColor: "#ead27a",
      borderRadius: 8,
      "&:focus": {
        borderColor: "#d8ad10",
      },
    },
    label: {
      fontWeight: 700,
      color: "#222",
      marginBottom: 6,
    },
  },
  primaryButton: {
    height: 52,
    borderRadius: 8,
    background: "#171717",
    fontWeight: 800,
    "&:hover": {
      background: "#2b2b2b",
    },
  },
  signInWith: {
    fontWeight: 500,
    "&:before": {
      content: "''",
      flex: 1,
      display: "block",
    },
    "&:after": {
      content: "''",
      flex: 1,
      display: "block",
    },
  },
  or: {
    "&:before": {
      content: "''",
      flex: 1,
      display: "block",
      borderTopWidth: 1,
      borderTopStyle: "solid",
      borderColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[3]
          : theme.colors.gray[4],
    },
    "&:after": {
      content: "''",
      flex: 1,
      display: "block",
      borderTopWidth: 1,
      borderTopStyle: "solid",
      borderColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[3]
          : theme.colors.gray[4],
    },
  },
}));

const SignInForm = ({ redirectPath }: { redirectPath: string }) => {
  const config = useConfig();
  const router = useRouter();
  const t = useTranslate();
  const { refreshUser } = useUser();
  const { classes } = useStyles();
  const { locale } = useIntl();
  const isZh = locale.startsWith("zh");

  const [oauthProviders, setOauthProviders] = useState<string[] | null>(null);
  const [isRedirectingToOauthProvider, setIsRedirectingToOauthProvider] =
    useState(false);

  const validationSchema = yup.object().shape({
    emailOrUsername: yup.string().required(t("common.error.field-required")),
    password: yup.string().required(t("common.error.field-required")),
  });

  const form = useForm({
    initialValues: {
      emailOrUsername: "",
      password: "",
    },
    validate: yupResolver(validationSchema),
  });

  const signIn = async (email: string, password: string) => {
    await authService
      .signIn(email.trim(), password.trim())
      .then(async (response) => {
        if (response.data["loginToken"]) {
          // Prompt the user to enter their totp code
          showNotification({
            icon: <TbInfoCircle />,
            color: "blue",
            radius: "md",
            title: t("signIn.notify.totp-required.title"),
            message: t("signIn.notify.totp-required.description"),
          });
          router.push(
            `/auth/totp/${
              response.data["loginToken"]
            }?redirect=${encodeURIComponent(redirectPath)}`,
          );
        } else {
          await refreshUser();
          router.replace(safeRedirectPath(redirectPath));
        }
      })
      .catch(toast.axiosError);
  };

  useEffect(() => {
    authService
      .getAvailableOAuth()
      .then((providers) => {
        setOauthProviders(providers.data);
        if (
          providers.data.length === 1 &&
          config.get("oauth.disablePassword")
        ) {
          setIsRedirectingToOauthProvider(true);
          router.push(getOAuthUrl(window.location.origin, providers.data[0]));
        }
      })
      .catch(() => setOauthProviders([]));
  }, []);

  if (!oauthProviders) return null;

  if (isRedirectingToOauthProvider)
    return (
      <Group align="center" position="center">
        <Loader size="sm" />
        <Text align="center">
          <FormattedMessage id="common.text.redirecting" />
        </Text>
      </Group>
    );

  return (
    <Box className={classes.page}>
      <Box className={classes.hero}>
        <Box className={classes.logo}>
          <Box className={classes.logoMark}>
            <Logo height={34} width={34} />
          </Box>
          <span>{isZh ? "星闪包" : "StellarTransfer"}</span>
        </Box>
        <Box className={classes.heroCopy}>
          <Text size="sm" weight={800} transform="uppercase">
            {isZh ? "文件快传" : "File Transfer"}
          </Text>
          <Title order={1} mt={8} sx={{ maxWidth: 420, lineHeight: 1.05 }}>
            {isZh
              ? "更安静、更快速的文件传输空间。"
              : "Send files with a calmer, faster workspace."}
          </Title>
        </Box>
      </Box>
      <Box className={classes.main}>
        <Box className={classes.nav}>
          <Anchor component={Link} href="/upload" className={classes.navLink}>
            {t("navbar.upload")}
          </Anchor>
          <Anchor
            component={Link}
            href="/auth/signUp"
            className={classes.navLink}
          >
            {t("navbar.signup")}
          </Anchor>
        </Box>
        <Box className={classes.card}>
          <Title order={2} weight={900}>
            <FormattedMessage id="signin.title" />
          </Title>
          {config.get("share.allowRegistration") && (
            <Text color="dimmed" size="sm" mt={8} mb={28}>
              <FormattedMessage id="signin.description" />{" "}
              <Anchor
                component={Link}
                href={"/auth/signUp"}
                size="sm"
                weight={800}
              >
                <FormattedMessage id="signin.button.signup" />
              </Anchor>
            </Text>
          )}
          {config.get("oauth.disablePassword") || (
            <form
              onSubmit={form.onSubmit((values) => {
                signIn(values.emailOrUsername, values.password);
              })}
            >
              <TextInput
                className={classes.input}
                label={t("signin.input.email-or-username")}
                placeholder={t("signin.input.email-or-username.placeholder")}
                {...form.getInputProps("emailOrUsername")}
              />
              <PasswordInput
                className={classes.input}
                label={t("signin.input.password")}
                placeholder={t("signin.input.password.placeholder")}
                mt="md"
                {...form.getInputProps("password")}
              />
              {config.get("smtp.enabled") && (
                <Group position="right" mt="xs">
                  <Anchor component={Link} href="/auth/resetPassword" size="xs">
                    <FormattedMessage id="resetPassword.title" />
                  </Anchor>
                </Group>
              )}
              <Button
                fullWidth
                mt="xl"
                type="submit"
                className={classes.primaryButton}
              >
                <FormattedMessage id="signin.button.submit" />
              </Button>
            </form>
          )}
          {oauthProviders.length > 0 && (
            <Stack mt={config.get("oauth.disablePassword") ? undefined : "xl"}>
              {config.get("oauth.disablePassword") ? (
                <Group align="center" className={classes.signInWith}>
                  <Text>{t("signIn.oauth.signInWith")}</Text>
                </Group>
              ) : (
                <Group align="center" className={classes.or}>
                  <Text>{t("signIn.oauth.or")}</Text>
                </Group>
              )}
              <Group position="center">
                {oauthProviders.map((provider) => (
                  <Button
                    key={provider}
                    component="a"
                    title={t(`signIn.oauth.${provider}`)}
                    href={getOAuthUrl(window.location.origin, provider)}
                    variant="light"
                    fullWidth
                    h={48}
                  >
                    {getOAuthIcon(provider)}
                    {"\u2002" + t(`signIn.oauth.${provider}`)}
                  </Button>
                ))}
              </Group>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SignInForm;
