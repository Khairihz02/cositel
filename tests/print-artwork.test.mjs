import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
const scope={Blob,Uint8Array,DataView};
runInNewContext(await readFile(new URL('../public/assets/design-renderer.js',import.meta.url),'utf8'),scope);
const {withDpi,crc32,layout}=scope.LobbyDesign;
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7x8AAAAASUVORK5CYII=','base64');
function chunks(bytes){const result=[];for(let at=8;at<bytes.length;){const n=bytes.readUInt32BE(at);result.push({type:bytes.toString('ascii',at+4,at+8),data:bytes.subarray(at+8,at+8+n),crc:bytes.readUInt32BE(at+8+n)});at+=12+n;}return result;}
test('PNG export keeps image bytes and records exactly one 300 dpi physical size',async()=>{const once=await withDpi(new Blob([png],{type:'image/png'}));const twice=Buffer.from(await (await withDpi(once)).arrayBuffer());const all=chunks(twice),physical=all.filter(c=>c.type==='pHYs');assert.equal(physical.length,1);assert.equal(physical[0].data.readUInt32BE(0),11811);assert.equal(physical[0].data.readUInt32BE(4),11811);assert.equal(physical[0].data[8],1);assert.equal(physical[0].crc,crc32(Buffer.concat([Buffer.from('pHYs'),physical[0].data])));assert.deepEqual(all.find(c=>c.type==='IDAT').data,chunks(png).find(c=>c.type==='IDAT').data);assert.equal(once.type,'image/png');});
test('Imported logo keeps proportions within the enlarged printable mark',()=>{const l=layout({}, {size:32,mode:'logo'},'',{}, {x:0,y:0,width:400,height:100});assert.equal(l.width,320);assert.equal(l.height,80);const tall=layout({}, {size:32,mode:'logo'},'',{}, {x:0,y:0,width:100,height:400});assert.equal(tall.height,240);assert.equal(tall.width,60);});
test('Long text is wrapped and fitted to the print area',()=>{const ctx={font:'',measureText(text){return {width:text.length*Number.parseFloat(this.font)*0.65}}};const fitted=layout(ctx,{size:32,mode:'text',font:'Lobby Modern'},'Bienvenue chez vous dans votre maison hôtel',null,null);assert.ok(fitted.lines.length<=3);assert.ok(fitted.width<=320);assert.ok(fitted.lines.length*fitted.lineHeight<=220);assert.ok(fitted.size>6);});
