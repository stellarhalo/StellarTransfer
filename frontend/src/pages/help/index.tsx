import {
  Box,
  Container,
  createStyles,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Meta from "../../components/Meta";

const useStyles = createStyles(() => ({
  page: {
    minHeight: "100vh",
    background: "#ffffff",
    padding: "56px 20px",
  },
  card: {
    border: "1px solid #eeeeee",
    borderRadius: 24,
    boxShadow: "0 16px 44px rgba(0, 0, 0, 0.06)",
    padding: 32,
  },
  title: {
    fontWeight: 900,
    color: "#111111",
  },
  sectionTitle: {
    fontWeight: 900,
    color: "#111111",
  },
  text: {
    color: "#666666",
    fontWeight: 700,
    lineHeight: 1.8,
  },
}));

export default function Help() {
  const { classes } = useStyles();

  return (
    <Box className={classes.page}>
      <Meta title="帮助文档" />
      <Container size="md">
        <Paper className={classes.card}>
          <Stack spacing="xl">
            <Box>
              <Title className={classes.title} order={1}>
                帮助文档
              </Title>
              <Text className={classes.text} mt="sm">
                星闪包用于快速上传、分享和接收文件。管理员可以在配置管理中调整系统参数，普通用户只能访问自己的闪包和账号信息。
              </Text>
            </Box>

            <Box>
              <Title className={classes.sectionTitle} order={3}>
                上传文件
              </Title>
              <Text className={classes.text} mt="xs">
                在首页点击“添加文件”，选择文件后点击开始上传。传输完成后会生成分享链接和取件码。
              </Text>
            </Box>

            <Box>
              <Title className={classes.sectionTitle} order={3}>
                接收文件
              </Title>
              <Text className={classes.text} mt="xs">
                点击“接收文件”，输入 8 位取件码后即可打开对应分享并下载文件。
              </Text>
            </Box>

            <Box>
              <Title className={classes.sectionTitle} order={3}>
                管理后台
              </Title>
              <Text className={classes.text} mt="xs">
                只有管理员可以进入用户管理、共享管理和配置管理。右上角齿轮会根据当前账号权限决定是否可用。
              </Text>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
