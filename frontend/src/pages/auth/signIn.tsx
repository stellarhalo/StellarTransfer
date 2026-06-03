import { LoadingOverlay } from "@mantine/core";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import SignInForm from "../../components/auth/SignInForm";
import Meta from "../../components/Meta";
import useUser from "../../hooks/user.hook";
import useTranslate from "../../hooks/useTranslate.hook";

export function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: { redirectPath: context.query.redirect ?? null },
  };
}

const SignIn = ({ redirectPath }: { redirectPath?: string }) => {
  const { refreshUser } = useUser();
  const router = useRouter();
  const t = useTranslate();

  const [isLoading, setIsLoading] = useState(redirectPath ? true : false);

  useEffect(() => {
    refreshUser().then((user) => {
      if (user) {
        router.replace(redirectPath ?? "/upload");
      } else {
        setIsLoading(false);
      }
    });
  }, []);

  return (
    <>
      <Meta title={t("signin.title")} />
      <SignInForm redirectPath={redirectPath ?? "/upload"} />
      {isLoading && <LoadingOverlay overlayOpacity={0.3} visible />}
    </>
  );
};

export default SignIn;
