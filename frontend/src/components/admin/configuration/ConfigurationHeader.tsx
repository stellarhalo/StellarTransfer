import {
  Box,
  Burger,
  Button,
  Group,
  Header,
  MediaQuery,
  Text,
  useMantineTheme,
} from "@mantine/core";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import useConfig from "../../../hooks/config.hook";

const ConfigurationHeader = ({
  isMobileNavBarOpened,
  setIsMobileNavBarOpened,
}: {
  isMobileNavBarOpened: boolean;
  setIsMobileNavBarOpened: Dispatch<SetStateAction<boolean>>;
}) => {
  const config = useConfig();
  const theme = useMantineTheme();
  return (
    <Header
      height={84}
      p={16}
      sx={{
        background: "#ffffff",
        borderBottom: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          borderRadius: 0,
          background: "#ffffff",
          border: 0,
          boxShadow: "none",
          padding: "0 14px 0 18px",
        }}
      >
        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <Burger
            opened={isMobileNavBarOpened}
            onClick={() => setIsMobileNavBarOpened((o) => !o)}
            size="sm"
            color={theme.colors.gray[6]}
            mr="xl"
          />
        </MediaQuery>
        <Group position="apart" w="100%">
          <Link
            href="/"
            passHref
            style={{ color: "#171717", textDecoration: "none" }}
          >
            <Group>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 18,
                  display: "grid",
                  placeItems: "center",
                  background: "#171717",
                  color: "#ffd84d",
                  fontWeight: 900,
                }}
              >
                S
              </Box>
              <Text weight={900}>管理后台</Text>
            </Group>
          </Link>
          <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
            <Button
              variant="filled"
              component={Link}
              href="/admin/users"
              h={38}
              radius={20}
              sx={{
                background: "#171717",
                fontWeight: 800,
                "&:hover": { background: "#2b2b2b" },
              }}
            >
              <FormattedMessage id="common.button.go-back" />
            </Button>
          </MediaQuery>
        </Group>
      </div>
    </Header>
  );
};

export default ConfigurationHeader;
