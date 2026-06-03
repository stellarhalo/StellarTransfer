import {
  Box,
  ColorScheme,
  ColorSchemeProvider,
  Container,
  MantineProvider,
  Stack,
} from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import axios from "axios";
import { getCookie, setCookie } from "cookies-next";
import moment from "moment";
import "moment/min/locales";
import { GetServerSidePropsContext } from "next";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { IntlProvider } from "react-intl";
import Header from "../components/header/Header";
import { ConfigContext } from "../hooks/config.hook";
import { UserContext } from "../hooks/user.hook";
import { LOCALES } from "../i18n/locales";
import authService from "../services/auth.service";
import configService from "../services/config.service";
import userService from "../services/user.service";
import GlobalStyle from "../styles/global.style";
import globalStyle from "../styles/mantine.style";
import Config from "../types/config.type";
import { CurrentUser } from "../types/user.type";
import i18nUtil from "../utils/i18n.util";
import userPreferences from "../utils/userPreferences.util";
import Footer from "../components/footer/Footer";
import defaultConfigVariables from "../config/defaultConfig";

const excludeDefaultLayoutRoutes = [
  "/admin/config/[category]",
  "/admin",
  "/admin/users",
  "/admin/shares",
  "/account",
  "/account/shares",
  "/account/reverseShares",
  "/upload",
  "/upload/[reverseShareToken]",
  "/help",
  "/auth/signIn",
  "/auth/signUp",
  "/share/[shareId]",
  "/share/[shareId]/edit",
];

function App({ Component, pageProps }: AppProps) {
  const systemTheme = useColorScheme(pageProps.colorScheme);
  const router = useRouter();

  const [colorScheme, setColorScheme] = useState<ColorScheme>(systemTheme);

  const [user, setUser] = useState<CurrentUser | null>(pageProps.user);
  const [route, setRoute] = useState<string>(pageProps.route);

  const [configVariables, setConfigVariables] = useState<Config[]>(
    pageProps.configVariables,
  );

  useEffect(() => {
    setRoute(router.pathname);
  }, [router.pathname]);

  useEffect(() => {
    const interval = setInterval(
      async () => await authService.refreshAccessToken(),
      2 * 60 * 1000, // 2 minutes
    );

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!pageProps.language) return;
    const cookieLanguage = getCookie("language");
    if (pageProps.language != cookieLanguage) {
      i18nUtil.setLanguageCookie(pageProps.language);
      if (cookieLanguage) location.reload();
    }
  }, []);

  useEffect(() => {
    const colorScheme =
      userPreferences.get("colorScheme") == "system"
        ? systemTheme
        : userPreferences.get("colorScheme");

    toggleColorScheme(colorScheme);
  }, [systemTheme]);

  useEffect(() => {
    if (!configVariables) return;
    const getConfig = (key: string) => configService.get(key, configVariables);
    const currentRoute = router.pathname;

    if (!getConfig("share.allowRegistration") && currentRoute === "/auth/signUp") {
      router.replace("/");
      return;
    }

    if (!getConfig("smtp.enabled") && currentRoute.startsWith("/auth/resetPassword")) {
      router.replace("/");
      return;
    }

    if (!getConfig("legal.enabled")) {
      if (currentRoute === "/imprint" || currentRoute === "/privacy") {
        router.replace("/");
        return;
      }
    } else {
      if (currentRoute === "/imprint" && !getConfig("legal.imprintText") && getConfig("legal.imprintUrl")) {
        window.location.href = getConfig("legal.imprintUrl");
        return;
      }
      if (currentRoute === "/privacy" && !getConfig("legal.privacyPolicyText") && getConfig("legal.privacyPolicyUrl")) {
        window.location.href = getConfig("legal.privacyPolicyUrl");
        return;
      }
    }

    if ((!getConfig("general.showHomePage") || user) && currentRoute === "/") {
      router.replace("/upload");
      return;
    }
  }, [configVariables, router.pathname, user]);

  const toggleColorScheme = (value: ColorScheme) => {
    setColorScheme(value ?? "light");
    setCookie("mantine-color-scheme", value ?? "light", {
      sameSite: "lax",
    });
  };

  const language = useRef(pageProps.language);
  moment.locale(language.current);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </Head>
      <IntlProvider
        messages={i18nUtil.getLocaleByCode(language.current)?.messages}
        locale={language.current}
        defaultLocale={LOCALES.ENGLISH.code}
      >
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{ colorScheme, ...globalStyle }}
        >
          <ColorSchemeProvider
            colorScheme={colorScheme}
            toggleColorScheme={toggleColorScheme}
          >
            <GlobalStyle />
            <Notifications />
            <ModalsProvider>
              <ConfigContext.Provider
                value={{
                  configVariables,
                  refresh: async () => {
                    setConfigVariables(await configService.list());
                  },
                }}
              >
                <UserContext.Provider
                  value={{
                    user,
                    refreshUser: async () => {
                      const user = await userService.getCurrentUser();
                      setUser(user);
                      return user;
                    },
                  }}
                >
                  {excludeDefaultLayoutRoutes.includes(route) ? (
                    <Component {...pageProps} />
                  ) : (
                    <Box
                      sx={{
                        minHeight: "100vh",
                        background:
                          "radial-gradient(circle at 12% 18%, rgba(255, 216, 77, 0.42) 0 9%, transparent 10%), radial-gradient(circle at 88% 8%, rgba(54, 84, 103, 0.16) 0 12%, transparent 13%), linear-gradient(135deg, #f7f2e8 0%, #f3e1ad 46%, #d9e9ec 100%)",
                      }}
                    >
                      <Stack
                        justify="space-between"
                        sx={{ minHeight: "100vh" }}
                      >
                        <div>
                          <Header />
                          <Container
                            size="lg"
                            sx={{
                              background: "rgba(255, 255, 255, 0.96)",
                              border: "1px solid rgba(24, 25, 27, 0.08)",
                              borderRadius: 14,
                              boxShadow: "0 24px 70px rgba(27, 31, 35, 0.14)",
                              padding: 32,
                              marginBottom: 48,
                              "@media (max-width: 640px)": {
                                padding: 18,
                                borderRadius: 12,
                              },
                            }}
                          >
                            <Component {...pageProps} />
                          </Container>
                        </div>
                        <Footer />
                      </Stack>
                    </Box>
                  )}
                </UserContext.Provider>
              </ConfigContext.Provider>
            </ModalsProvider>
          </ColorSchemeProvider>
        </MantineProvider>
      </IntlProvider>
    </>
  );
}

// Fetch user and config variables on server side when the first request is made
// These will get passed as a page prop to the App component and stored in the contexts
App.getInitialProps = async ({ ctx }: { ctx: GetServerSidePropsContext }) => {
  let pageProps: {
    user?: CurrentUser;
    configVariables?: Config[];
    route?: string;
    colorScheme: ColorScheme;
    language?: string;
  } = {
    route: ctx.resolvedUrl,
    colorScheme:
      (getCookie("mantine-color-scheme", ctx) as ColorScheme) ?? "light",
  };

  if (ctx.req) {
    const apiURL = process.env.API_URL || "http://localhost:8080";
    const cookieHeader = ctx.req.headers.cookie;

    pageProps.user = await axios(`${apiURL}/api/users/me`, {
      headers: { cookie: cookieHeader },
    })
      .then((res) => res.data)
      .catch(() => null);

    pageProps.configVariables = await axios(`${apiURL}/api/configs`)
      .then((res) => res.data)
      .catch(() => defaultConfigVariables);

    pageProps.route = ctx.req.url;

    const requestLanguage = i18nUtil.getLanguageFromAcceptHeader(
      ctx.req.headers["accept-language"],
    );

    pageProps.language = ctx.req.cookies["language"] ?? requestLanguage;
  }
  return { pageProps };
};

export default App;
