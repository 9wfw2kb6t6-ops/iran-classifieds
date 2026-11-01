import { apiFetch } from "./api";
export async function reportListing(input:{listing_id:number;reason:string;details:string;reporter_contact:string}){
 const r=await apiFetch("/api/reports",{method:"POST",body:JSON.stringify(input)});
 const d=await r.json();if(!r.ok)throw new Error(d.error||"ثبت گزارش انجام نشد.");return d as {success:boolean;message:string};
}
