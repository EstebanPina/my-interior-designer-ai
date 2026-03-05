import type { Metadata } from "next";
import { Poiret_One, Quicksand, PT_Serif } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const poiretOne = Poiret_One({
 weight: "400",
});
const quicksand = Quicksand({
 weight: ["300", "400", "500", "600", "700"],
 subsets: ["latin"],
  display: "swap",
})
const ptSerif = PT_Serif({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
})


export const metadata: Metadata = {
  title: "My Interior Designer AI - Transforma tu espacio con Inteligencia Artificial",
  description: "Sube una foto de tu habitación y descubre cómo se vería con diferentes estilos de diseño interior. Obtén recomendaciones personalizadas y enlaces de compra.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${quicksand.className} ${poiretOne.className} antialiased text-gray-900 bg-white`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
