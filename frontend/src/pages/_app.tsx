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
import { getCookie, setCookie } from "cookies-next";
import moment from "moment";
import "moment/min/locales";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const systemTheme = useColorScheme();
  const router = useRouter();

  const [colorScheme, setColorScheme] = useState<ColorScheme>(systemTheme);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [route, setRoute] = useState<string>("");
  const [configVariables, setConfigVariables] = useState<Config[]>(
    defaultConfigVariables,
  );
  const [mounted, setMounted] = useState(false);

  const lastAccessToken = useRef<string | null>(null);

  const fetchConfig = useCallback(async () => {
    const vars = await configService.list();
    setConfigVariables(vars);
    return vars;
  }, []);

  const fetchUser = useCallback(async () => {
    const u = await userService.getCurrentUser().catch(() => null);
    setUser(u);
    return u;
  }, []);

  useEffect(() => {
    setMounted(true);
    setRoute(router.pathname);

    const language = i18nUtil.getLanguageFromNavigator();
    const cookieLanguage = getCookie("language");
    if (language && language !== cookieLanguage) {
      i18nUtil.setLanguageCookie(language);
    }

    fetchConfig();
    fetchUser();
  }, []);

  useEffect(() => {
    setRoute(router.pathname);
  }, [router.pathname]);

  useEffect(() => {
    const interval = setInterval(async () => {
      await authService.refreshAccessToken();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentToken = getCookie("access_token") as string | undefined;
    if (currentToken !== lastAccessToken.current) {
      lastAccessToken.current = currentToken ?? null;
      fetchUser();
    }
  }, [router.pathname]);

  useEffect(() => {
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

  const language = useRef(i18nUtil.getLanguageFromNavigator() ?? LOCALES.ENGLISH.code);
  moment.locale(language.current);

  if (!mounted) return null;

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
                  refresh: fetchConfig,
                }}
              >
                <UserContext.Provider
                  value={{
                    user,
                    refreshUser: async () => {
                      const u = await fetchUser();
                      return u;
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

export default App;
