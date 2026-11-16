import { clearedSessionCookie } from '../../../lib/admin-auth.mjs';
export const dynamic='force-dynamic';

export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return new Response('Origine non autorisée.',{status:403});
 return new Response(null,{status:303,headers:{Location:'/','Cache-Control':'no-store','Set-Cookie':clearedSessionCookie()}});
}
