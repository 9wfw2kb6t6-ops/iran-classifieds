import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "./api";
const KEY="se_sote_admin_session";
export async function adminLogin(password:string){
 const r=await fetch(API_BASE_URL+"/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json","x-client-app":"se-sote-mobile"},body:JSON.stringify({password})});
 const d=await r.json();if(!r.ok||!d.session_token)throw new Error(d.error||"ورود مدیر انجام نشد.");
 await SecureStore.setItemAsync(KEY,d.session_token);
}
export async function hasAdminSession(){ return Boolean(await SecureStore.getItemAsync(KEY)); }
export async function adminLogout(){
 try{await adminFetch("/api/admin/logout",{method:"POST"});}finally{await SecureStore.deleteItemAsync(KEY);}
}
export async function adminFetch(path:string,init:RequestInit={}){
 const token=await SecureStore.getItemAsync(KEY);const headers=new Headers(init.headers||{});
 headers.set("Accept","application/json");if(token)headers.set("Authorization","Bearer "+token);
 if(init.body)headers.set("Content-Type","application/json");
 return fetch(API_BASE_URL+path,{...init,headers});
}
export async function adminJson<T>(path:string,init?:RequestInit):Promise<T>{
 const r=await adminFetch(path,init);const d=await r.json();if(!r.ok)throw new Error(d.error||"عملیات مدیریت انجام نشد.");return d as T;
}
