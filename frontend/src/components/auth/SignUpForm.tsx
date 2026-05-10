import {
  Anchor,
  Box,
  Button,
  createStyles,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormattedMessage, useIntl } from "react-intl";
import * as yup from "yup";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import useUser from "../../hooks/user.hook";
import authService from "../../services/auth.service";
import toast from "../../utils/toast.util";
import Logo from "../Logo";

const useStyles = createStyles(() => ({
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
      "linear-gradient(145deg, rgba(22, 21, 18, 0.18), rgba(22, 21, 18, 0.58)), radial-gradient(circle at 18% 78%, #ffd84d 0 13%, transparent 14%), linear-gradient(150deg, #31516a 0%, #ccb28c 52%, #ecd69a 100%)",
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
}));

const SignUpForm = () => {
  const config = useConfig();
  const router = useRouter();
  const t = useTranslate();
  const { refreshUser } = useUser();
  const { classes } = useStyles();
  const { locale } = useIntl();
  const isZh = locale.startsWith("zh");

  const validationSchema = yup.object().shape({
    email: yup.string().email(t("common.error.invalid-email")).required(),
    username: yup
      .string()
      .min(3, t("common.error.too-short", { length: 3 }))
      .required(t("common.error.field-required")),
    password: yup
      .string()
      .min(8, t("common.error.too-short", { length: 8 }))
      .required(t("common.error.field-required")),
  });

  const form = useForm({
    initialValues: {
      email: "",
      username: "",
      password: "",
    },
    validate: yupResolver(validationSchema),
  });

  const signUp = async (email: string, username: string, password: string) => {
    await authService
      .signUp(email.trim(), username.trim(), password.trim())
      .then(async () => {
        const user = await refreshUser();
        if (user?.isAdmin) {
          router.replace("/admin/intro");
        } else {
          router.replace("/upload");
        }
      })
      .catch(toast.axiosError);
  };

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
          <Title order={1} mt={8} sx={{ maxWidth: 430, lineHeight: 1.05 }}>
            {isZh
              ? "几秒钟搭建你的私有文件传输台。"
              : "Build a private transfer desk in seconds."}
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
            href="/auth/signIn"
            className={classes.navLink}
          >
            {t("navbar.signin")}
          </Anchor>
        </Box>
        <Paper className={classes.card}>
          <Title order={2} weight={900}>
            <FormattedMessage id="signup.title" />
          </Title>
          {config.get("share.allowRegistration") && (
            <Text color="dimmed" size="sm" mt={8} mb={28}>
              <FormattedMessage id="signup.description" />{" "}
              <Anchor
                component={Link}
                href={"/auth/signIn"}
                size="sm"
                weight={800}
              >
                <FormattedMessage id="signup.button.signin" />
              </Anchor>
            </Text>
          )}
          <form
            onSubmit={form.onSubmit((values) =>
              signUp(values.email, values.username, values.password),
            )}
          >
            <TextInput
              className={classes.input}
              label={t("signup.input.username")}
              placeholder={t("signup.input.username.placeholder")}
              {...form.getInputProps("username")}
            />
            <TextInput
              className={classes.input}
              label={t("signup.input.email")}
              placeholder={t("signup.input.email.placeholder")}
              mt="md"
              {...form.getInputProps("email")}
            />
            <PasswordInput
              className={classes.input}
              label={t("signin.input.password")}
              placeholder={t("signin.input.password.placeholder")}
              mt="md"
              {...form.getInputProps("password")}
            />
            <Button
              fullWidth
              mt="xl"
              type="submit"
              className={classes.primaryButton}
            >
              <FormattedMessage id="signup.button.submit" />
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default SignUpForm;
