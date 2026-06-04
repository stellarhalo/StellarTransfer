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
import { useRouter } from "next/router";
import { FormattedMessage, useIntl } from "react-intl";
import * as yup from "yup";
import useTranslate from "../../hooks/useTranslate.hook";
import useUser from "../../hooks/user.hook";
import authService from "../../services/auth.service";
import toast from "../../utils/toast.util";
import Logo from "../../components/Logo";
import Meta from "../../components/Meta";

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
    width: "100%",
    "& .mantine-TextInput-input": {
      minHeight: 48,
      borderColor: "#ead27a",
      borderWidth: 1.5,
      borderRadius: 8,
      backgroundColor: "#fff",
      "&:focus": {
        borderColor: "#d8ad10",
      },
    },
    "& .mantine-PasswordInput-input": {
      minHeight: 48,
      borderColor: "#ead27a",
      borderWidth: 1.5,
      borderRadius: 8,
      backgroundColor: "#fff",
      "&:focus": {
        borderColor: "#d8ad10",
      },
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

const AdminSetup = () => {
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

  const signUpAdmin = async (
    email: string,
    username: string,
    password: string,
  ) => {
    await authService
      .signUpAdmin(email.trim(), username.trim(), password.trim())
      .then(async () => {
        await refreshUser();
        router.replace("/admin/intro");
      })
      .catch(toast.axiosError);
  };

  return (
    <Box className={classes.page}>
      <Meta title={isZh ? "初始化管理员" : "Admin Setup"} />
      <Box className={classes.hero}>
        <Box className={classes.logo}>
          <Box className={classes.logoMark}>
            <Logo height={34} width={34} />
          </Box>
          <span>{isZh ? "星闪包" : "StellarTransfer"}</span>
        </Box>
        <Box className={classes.heroCopy}>
          <Text size="sm" weight={800} transform="uppercase">
            {isZh ? "首次部署" : "First Setup"}
          </Text>
          <Title order={1} mt={8} sx={{ maxWidth: 430, lineHeight: 1.05 }}>
            {isZh
              ? "欢迎使用星闪包，请先创建管理员账号。"
              : "Welcome to StellarTransfer. Create your admin account to get started."}
          </Title>
        </Box>
      </Box>
      <Box className={classes.main}>
        <Paper className={classes.card}>
          <Title order={2} weight={900}>
            {isZh ? "创建管理员账号" : "Create Admin Account"}
          </Title>
          <Text color="dimmed" size="sm" mt={8} mb={28}>
            {isZh
              ? "这是系统中的第一个账号，将拥有管理员权限。"
              : "This is the first account in the system and will have admin privileges."}
          </Text>
          <form
            onSubmit={form.onSubmit((values) =>
              signUpAdmin(values.email, values.username, values.password),
            )}
          >
            <TextInput
              classNames={{ input: classes.input }}
              label={t("signup.input.username")}
              placeholder={t("signup.input.username.placeholder")}
              {...form.getInputProps("username")}
            />
            <TextInput
              classNames={{ input: classes.input }}
              label={t("signup.input.email")}
              placeholder={t("signup.input.email.placeholder")}
              mt="md"
              {...form.getInputProps("email")}
            />
            <PasswordInput
              classNames={{ input: classes.input }}
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
              {isZh ? "创建管理员" : "Create Admin"}
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminSetup;
