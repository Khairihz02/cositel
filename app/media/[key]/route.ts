import { env } from 'cloudflare:workers';
import { fileStore } from '../../../lib/file-store.mjs';
const files=()=>fileStore((env as any).FILES);
export async function GET(request:Request){const key=new URL(request.url).pathname.split('/').pop()||'';if(!/^[a-f0-9-]+\.(png|jpg|webp)$/.test(key)||!files())return new Response('Introuvable',{status:404});const obj=await files()!.get(key);if(!obj)return new Response('Introuvable',{status:404});return new Response(obj.body,{headers:{'Content-Type':obj.httpMetadata?.contentType||'application/octet-stream','Cache-Control':'public,max-age=31536000,immutable','X-Content-Type-Options':'nosniff'}})}
