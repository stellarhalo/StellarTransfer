import { MantineThemeOverride } from "@mantine/core";

export default <MantineThemeOverride>{
  colors: {
    victoria: [
      "#E2E1F1",
      "#C2C0E7",
      "#A19DE4",
      "#7D76E8",
      "#544AF4",
      "#4940DE",
      "#4239C8",
      "#463FA8",
      "#47428E",
      "#464379",
    ],
  },
  primaryColor: "yellow",
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
      styles: () => ({
        root: {
          fontWeight: 800,
          minHeight: 40,
        },
      }),
    },
    Paper: {
      defaultProps: {
        radius: "md",
      },
    },
    TextInput: {
      styles: () => ({
        input: {
          "&:focus": {
            borderColor: "#d8ad10",
          },
        },
      }),
    },
    PasswordInput: {
      styles: () => ({
        input: {
          "&:focus": {
            borderColor: "#d8ad10",
          },
        },
      }),
    },
    Modal: {
      styles: (theme) => ({
        title: {
          fontSize: theme.fontSizes.lg,
          fontWeight: 700,
        },
      }),
    },
  },
};
