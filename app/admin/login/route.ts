import { env } from 'cloudflare:workers';
import { createSessionToken, passwordMatches, sessionCookie } from '../../../lib/admin-auth.mjs';
export const dynamic='force-dynamic';

const redirect=(location:string,cookie?:string)=>new Response(null,{status:303,headers:{Location:location,'Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}});

export async function POST(request:Request){
 // Only accept the form posted from this site.
 if(request.headers.get('origin')!==new URL(request.url).origin)return new Response('Origine non autorisée.',{status:403});
 const password=(env as any).ADMIN_PASSWORD;
 let candidate:unknown=null;
 try{candidate=(await request.formData()).get('password');}catch{candidate=null;}
 if(await passwordMatches(candidate as string,password))return redirect('/admin',sessionCookie(await createSessionToken(password)));
 // Slow down repeated guesses.
 await new Promise(resolve=>setTimeout(resolve,1000));
 return redirect('/admin?erreur=1');
}
