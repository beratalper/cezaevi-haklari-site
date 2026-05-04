import ServerKararList from "./server-list";
import KararlarClient from "./kararlar-client";

export default function KararlarPage() {
  return (
    <>
      <KararlarClient />
      <ServerKararList />
    </>
  );
}