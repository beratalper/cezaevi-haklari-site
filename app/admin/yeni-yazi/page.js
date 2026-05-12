import YaziForm from "@/components/YaziForm";

export default function YeniYaziPage() {
    return (
        <main className="min-h-screen bg-[#070b14] text-white px-6 py-20">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-4xl font-bold mb-10">
                    Yeni Yazı
                </h1>

                <YaziForm />
            </div>
        </main>
    );
}