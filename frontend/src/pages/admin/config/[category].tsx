import {
  Alert,
  Box,
  Button,
  createStyles,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import {
  TbAt,
  TbBinaryTree,
  TbBucket,
  TbInfoCircle,
  TbMail,
  TbScale,
  TbServerBolt,
  TbSettings,
  TbShare,
  TbSocial,
} from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import AdminConfigInput from "../../../components/admin/configuration/AdminConfigInput";
import LogoConfigInput from "../../../components/admin/configuration/LogoConfigInput";
import TestEmailButton from "../../../components/admin/configuration/TestEmailButton";
import CenterLoader from "../../../components/core/CenterLoader";
import DriveWorkspace from "../../../components/layout/DriveWorkspace";
import Meta from "../../../components/Meta";
import useConfig from "../../../hooks/config.hook";
import useTranslate from "../../../hooks/useTranslate.hook";
import configService from "../../../services/config.service";
import { AdminConfig, UpdateConfig } from "../../../types/config.type";
import { camelToKebab } from "../../../utils/string.util";
import toast from "../../../utils/toast.util";

const categories: { id: string; icon: ReactNode }[] = [
  { id: "general", icon: <TbSettings size={22} /> },
  { id: "email", icon: <TbMail size={22} /> },
  { id: "share", icon: <TbShare size={22} /> },
  { id: "smtp", icon: <TbAt size={22} /> },
  { id: "oauth", icon: <TbSocial size={22} /> },
  { id: "ldap", icon: <TbBinaryTree size={22} /> },
  { id: "s3", icon: <TbBucket size={22} /> },
  { id: "legal", icon: <TbScale size={22} /> },
  { id: "cache", icon: <TbServerBolt size={22} /> },
];

const useStyles = createStyles(() => ({
  summary: {
    marginBottom: 26,
  },
  summaryCard: {
    border: "1px solid #eeeeee",
    borderRadius: 24,
    padding: "22px 24px",
    background: "#ffffff",
    boxShadow: "0 12px 34px rgba(0, 0, 0, 0.05)",
  },
  configList: {
    gap: 14,
  },
  configRow: {
    border: "1px solid #eeeeee",
    borderRadius: 22,
    padding: "22px 24px",
    background: "#ffffff",
    boxShadow: "0 10px 28px rgba(0, 0, 0, 0.04)",
  },
  configTitle: {
    color: "#111111",
    fontWeight: 900,
  },
  configDescription: {
    maxWidth: 520,
    color: "#8a8a8a",
    fontWeight: 700,
    lineHeight: 1.6,
  },
  inputArea: {
    width: "min(460px, 100%)",
  },
  saveButton: {
    height: 48,
    padding: "0 30px",
    borderRadius: 24,
    background: "#ffd84d",
    color: "#111111",
    fontWeight: 900,
    boxShadow: "0 10px 20px rgba(255, 216, 77, 0.32)",
    "&:hover": {
      background: "#ffdf68",
    },
  },
  sidebarFooter: {
    color: "#9b9b9b",
    fontWeight: 800,
    fontSize: 13,
  },
}));

export default function AdminConfigCategory() {
  const { classes } = useStyles();
  const router = useRouter();
  const t = useTranslate();
  const isMobile = useMediaQuery("(max-width: 760px)");
  const config = useConfig();

  const categoryId = (router.query.category as string | undefined) ?? "general";

  const [configVariables, setConfigVariables] = useState<AdminConfig[]>();
  const [updatedConfigVariables, setUpdatedConfigVariables] = useState<
    UpdateConfig[]
  >([]);
  const [logo, setLogo] = useState<File | null>(null);
  const [search, setSearch] = useState("");

  const isEditingAllowed = (): boolean => {
    return !configVariables || configVariables[0].allowEdit;
  };

  const saveConfigVariables = async () => {
    if (logo) {
      configService
        .changeLogo(logo)
        .then(() => {
          setLogo(null);
          toast.success(t("admin.config.notify.logo-success"));
        })
        .catch(toast.axiosError);
    }

    if (updatedConfigVariables.length > 0) {
      await configService
        .updateMany(updatedConfigVariables)
        .then(() => {
          setUpdatedConfigVariables([]);
          toast.success(t("admin.config.notify.success"));
        })
        .catch(toast.axiosError);
      void config.refresh();
    } else {
      toast.success(t("admin.config.notify.no-changes"));
    }
  };

  const updateConfigVariable = (configVariable: UpdateConfig) => {
    if (configVariable.key === "general.appUrl") {
      configVariable.value = sanitizeUrl(configVariable.value);
    }

    const index = updatedConfigVariables.findIndex(
      (item) => item.key === configVariable.key,
    );

    if (index > -1) {
      setUpdatedConfigVariables(
        updatedConfigVariables.map((item, itemIndex) =>
          itemIndex === index ? { ...item, ...configVariable } : item,
        ),
      );
    } else {
      setUpdatedConfigVariables([...updatedConfigVariables, configVariable]);
    }
  };

  const sanitizeUrl = (url: string): string => {
    return url.endsWith("/") ? url.slice(0, -1) : url;
  };

  useEffect(() => {
    setConfigVariables(undefined);
    setUpdatedConfigVariables([]);
    setSearch("");
    configService.getByCategory(categoryId).then((configVariables) => {
      setConfigVariables(configVariables);
    });
  }, [categoryId]);

  const visibleConfigVariables = configVariables?.filter((configVariable) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    const titleKey = `admin.config.${camelToKebab(configVariable.key)}`;
    const descriptionKey = `${titleKey}.description`;

    return [
      configVariable.key,
      configVariable.value,
      configVariable.defaultValue,
      t(titleKey),
      t(descriptionKey),
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return (
    <DriveWorkspace
      section="配置管理"
      sectionHref="/admin"
      title={t("admin.config.category." + categoryId)}
      activePath={`/admin/config/${categoryId}`}
      searchPlaceholder="在配置项中搜索"
      searchValue={search}
      onSearchChange={setSearch}
      navItems={categories.map((category) => ({
        href: `/admin/config/${category.id}`,
        icon: category.icon,
        label: t(`admin.config.category.${category.id}`),
      }))}
      sidebarFooter={
        <Box className={classes.sidebarFooter}>
          <Text>StellarTransfer</Text>
          <Text mt={6}>配置中心</Text>
        </Box>
      }
      action={
        <Group spacing={10} noWrap>
          {categoryId === "smtp" && (
            <TestEmailButton
              configVariablesChanged={updatedConfigVariables.length !== 0}
              saveConfigVariables={saveConfigVariables}
            />
          )}
          <Button className={classes.saveButton} onClick={saveConfigVariables}>
            <FormattedMessage id="common.button.save" />
          </Button>
        </Group>
      }
    >
      <Meta title={t("admin.config.title")} />
      {!configVariables ? (
        <CenterLoader />
      ) : (
        <>
          <Paper className={classes.summaryCard}>
            <Group
              position="apart"
              align="flex-start"
              className={classes.summary}
            >
              <Box>
                <Title order={2} weight={900}>
                  {t("admin.config.category." + categoryId)}
                </Title>
                <Text color="dimmed" weight={700} mt={8}>
                  共 {configVariables.length} 个配置项
                  {search && `，匹配 ${visibleConfigVariables?.length ?? 0} 项`}
                </Text>
              </Box>
              <Text color="dimmed" weight={800}>
                {updatedConfigVariables.length > 0
                  ? `${updatedConfigVariables.length} 项待保存`
                  : "暂无未保存修改"}
              </Text>
            </Group>
            {!isEditingAllowed() && (
              <Alert
                variant="light"
                color="yellow"
                title={t("admin.config.config-file-warning.title")}
                icon={<TbInfoCircle />}
              >
                <FormattedMessage id="admin.config.config-file-warning.description" />
              </Alert>
            )}
          </Paper>

          <Stack className={classes.configList} mt={18}>
            {visibleConfigVariables?.map((configVariable) => (
              <Paper className={classes.configRow} key={configVariable.key}>
                <Group position="apart" align="flex-start" noWrap={!isMobile}>
                  <Stack spacing={6} maw={isMobile ? "100%" : 520}>
                    <Title className={classes.configTitle} order={5}>
                      <FormattedMessage
                        id={`admin.config.${camelToKebab(configVariable.key)}`}
                      />
                    </Title>
                    <Text
                      className={classes.configDescription}
                      size="sm"
                      sx={{ whiteSpace: "pre-line" }}
                    >
                      <FormattedMessage
                        id={`admin.config.${camelToKebab(
                          configVariable.key,
                        )}.description`}
                        values={{ br: <br /> }}
                      />
                    </Text>
                  </Stack>
                  <Box className={classes.inputArea}>
                    <AdminConfigInput
                      key={configVariable.key}
                      configVariable={configVariable}
                      updateConfigVariable={updateConfigVariable}
                    />
                  </Box>
                </Group>
              </Paper>
            ))}
            {categoryId === "general" && (
              <Paper className={classes.configRow}>
                <LogoConfigInput logo={logo} setLogo={setLogo} />
              </Paper>
            )}
          </Stack>
        </>
      )}
    </DriveWorkspace>
  );
}
