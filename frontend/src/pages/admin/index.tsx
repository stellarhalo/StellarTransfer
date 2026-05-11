import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/admin/users",
    permanent: false,
  },
});

export default function AdminRedirect() {
  return null;
}
