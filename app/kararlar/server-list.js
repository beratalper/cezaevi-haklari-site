import { supabase } from "../lib/supabase";

export default async function ServerKararList() {
  const { data } = await supabase
    .from("kararlar")
    .select("basvuru_no, karar_adi")
    .eq("cezaevi_mi", true)
    .limit(1000);

  return (
    <div style={{ display: "none" }}>
      {data?.map((item) => (
        <a
          key={item.basvuru_no}
          href={`/kararlar/${item.basvuru_no.replace("/", "-")}`}
        >
          {item.karar_adi}
        </a>
      ))}
    </div>
  );
}