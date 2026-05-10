import Head from "next/head";
import { useIntl } from "react-intl";
import useConfig from "../hooks/config.hook";

const Meta = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  const config = useConfig();
  const { locale } = useIntl();

  const appName = locale.startsWith("zh")
    ? "星闪包"
    : config.get("general.appName");
  const metaTitle = `${title} - ${appName}`;

  return (
    <Head>
      <title>{metaTitle}</title>
      <meta name="og:title" content={metaTitle} />
      <meta
        name="og:description"
        content={
          description ?? "An open-source and self-hosted sharing platform."
        }
      />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={description} />
    </Head>
  );
};

export default Meta;
