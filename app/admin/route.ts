import { env } from 'cloudflare:workers';
import adminHtml from '../../lib/admin-html';
import { adminAllowed } from '../../lib/api';
import { MIN_PASSWORD_LENGTH } from '../../lib/admin-auth.mjs';
export const dynamic='force-dynamic';

const headers={'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY'};

const logoutForm='<form method="post" action="/admin/logout" style="margin-top:10px"><button type="submit" style="all:unset;cursor:pointer;text-decoration:underline">Se déconnecter</button></form>';
const sidebarEnd='Voir la boutique ↗</a></div></aside>';

function loginPage(message:string){
 return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><link rel="icon" href="/favicon.svg"><title>Cositel — Connexion gestionnaire</title></head>'
 +'<body style="margin:0;background:#faf7f0;color:#15264f;font:17px/1.6 Arial,sans-serif"><main style="max-width:420px;margin:0 auto;padding:12vh 16px">'
 +'<h1 style="font:600 34px Arial,sans-serif;margin:0 0 8px">Cositel · Gestion</h1><p style="margin:0 0 24px">Cet espace est réservé au gestionnaire de la boutique.</p>'
 +(message?'<p role="alert" style="background:#fff;border:1px solid #c9b9a0;border-radius:8px;padding:10px 14px">'+message+'</p>':'')
 +'<form method="post" action="/admin/login"><label for="password" style="display:block;font-weight:600;margin-bottom:6px">Mot de passe</label>'
 +'<input id="password" name="password" type="password" autocomplete="current-password" required autofocus style="box-sizing:border-box;width:100%;font:inherit;padding:10px 12px;border:1px solid #c9b9a0;border-radius:8px;background:#fff;color:inherit">'
 +'<button type="submit" style="margin-top:14px;width:100%;font:600 16px Arial,sans-serif;padding:12px;border:0;border-radius:8px;background:#15264f;color:#faf7f0;cursor:pointer">Se connecter</button></form>'
 +'<p style="margin-top:24px"><a href="/" style="color:inherit">Retour à la boutique</a></p></main></body></html>';
}

export async function GET(request:Request){
 if(await adminAllowed(request))return new Response(adminHtml.replace(sidebarEnd,'Voir la boutique ↗</a>'+logoutForm+'</div></aside>'),{headers});
 const password=(env as any).ADMIN_PASSWORD;
 const configured=typeof password==='string'&&password.length>=MIN_PASSWORD_LENGTH;
 const failed=new URL(request.url).searchParams.has('erreur');
 const message=!configured?'La connexion n’est pas encore configurée : définissez le secret ADMIN_PASSWORD ('+MIN_PASSWORD_LENGTH+' caractères minimum).':failed?'Mot de passe incorrect.':'';
 return new Response(loginPage(message),{status:401,headers});
}
