import {
  Box,
  Button,
  Center,
  Container,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useIntl } from "react-intl";
import Logo from "../../components/Logo";
import Meta from "../../components/Meta";

const Intro = () => {
  const { locale } = useIntl();
  const isZh = locale.startsWith("zh");

  return (
    <>
      <Meta title={isZh ? "初始化" : "Intro"} />
      <Container size="xs">
        <Stack>
          <Center>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 24,
                display: "grid",
                placeItems: "center",
                boxShadow: "0 18px 42px rgba(24, 25, 27, 0.18)",
              }}
            >
              <Logo height={56} width={56} />
            </Box>
          </Center>
          <Center>
            <Title order={2}>
              {isZh ? "欢迎使用星闪包" : "Welcome to StellarTransfer"}
            </Title>
          </Center>
          <Text>
            {isZh
              ? "星闪包已准备就绪。你可以先在配置页面检查传输限制、法律文本、邮件设置和品牌设置。"
              : "StellarTransfer is ready. Start by checking the transfer limits, legal text, mail settings, and branding from the configuration page."}
          </Text>
          <Text mt="lg">
            {isZh ? "你想如何继续？" : "How do you want to continue?"}
          </Text>
          <Stack>
            <Button href="/admin/config/general" component={Link}>
              {isZh ? "自定义配置" : "Customize configuration"}
            </Button>
            <Button href="/upload" component={Link} variant="light">
              {isZh ? "进入星闪包" : "Explore StellarTransfer"}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

export default Intro;
