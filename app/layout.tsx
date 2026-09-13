import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import './globals.css';
import './world.css';
import {stateCssVariables} from '@/lib/tokens/state';
const inter=Inter({variable:'--font-inter',subsets:['latin']});
export const metadata:Metadata={
 metadataBase:new URL('https://innerflect-mirror.snappy-dell-4014.chatgpt.site'),
 title:'Mirror · Innerflect',
 description:'Autonomy you can see. Governance you can trust.',
 openGraph:{title:'Mirror · Innerflect',description:'Autonomy you can see. Governance you can trust.',images:['/og.png']},
 twitter:{card:'summary_large_image',title:'Mirror · Innerflect',description:'Autonomy you can see. Governance you can trust.',images:['/og.png']}
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){
 return <html lang="en">
  <head>
   {/* State palette generated from lib/tokens/state.ts, so the stylesheet and
       the WebGL scene cannot drift apart. Server-rendered: no flash, no JS. */}
   <style dangerouslySetInnerHTML={{__html:stateCssVariables()}}/>
  </head>
  <body className={inter.variable}>{children}</body>
 </html>
}
