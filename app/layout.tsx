import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import './globals.css';
import './world.css';
const inter=Inter({variable:'--font-inter',subsets:['latin']});
export const metadata:Metadata={
 metadataBase:new URL('https://innerflect-mirror.snappy-dell-4014.chatgpt.site'),
 title:'Mirror · Innerflect',
 description:'Autonomy you can see. Governance you can trust.',
 openGraph:{title:'Mirror · Innerflect',description:'Autonomy you can see. Governance you can trust.',images:['/og.png']},
 twitter:{card:'summary_large_image',title:'Mirror · Innerflect',description:'Autonomy you can see. Governance you can trust.',images:['/og.png']}
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body className={inter.variable}>{children}</body></html>}
