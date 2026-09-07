import type { Metadata } from 'next';
import './globals.css';


export const metadata: Metadata = {
  title: 'AutoTried — автомобили и спецтехника под ключ',
  description: 'Автомобили из Кореи, ОАЭ, Европы и США. Подбор, проверка, доставка и сопровождение оформления. Запросите индивидуальный расчёт в AutoTried.',
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        {children}
      </body>
    </html>
  );
}
