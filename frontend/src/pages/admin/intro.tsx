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
import Meta from "../../components/Meta";

const Intro = () => {
  return (
    <>
      <Meta title="Intro" />
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
                background: "#171717",
                color: "#ffd84d",
                fontSize: 42,
                fontWeight: 900,
                boxShadow: "0 18px 42px rgba(24, 25, 27, 0.18)",
              }}
            >
              S
            </Box>
          </Center>
          <Center>
            <Title order={2}>Welcome to StellarTransfer</Title>
          </Center>
          <Text>
            StellarTransfer / 星闪包 is ready. Start by checking the transfer
            limits, legal text, mail settings, and branding from the
            configuration page.
          </Text>
          <Text mt="lg">How do you want to continue?</Text>
          <Stack>
            <Button href="/admin/config/general" component={Link}>
              Customize configuration
            </Button>
            <Button href="/upload" component={Link} variant="light">
              Explore StellarTransfer
            </Button>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

export default Intro;
