import { apiFetch } from "./api";
export type StoreBuilderRequest = {
 id:number; business_name:string; contact_phone:string; store_model:"inside"|"independent";
 plan_code:"basic"|"pro"|"custom"; description:string; status:string;
 quoted_price_toman:number|null; prepayment_amount_toman:number|null;
 prepayment_confirmed_at:string|null; customer_feedback:string|null;
 customer_approved_at:string|null; deliverable_url:string|null; admin_note:string|null;
 requested_at:string; updated_at:string;
};
export type StoreMessage={id:number;sender_role:"user"|"admin";body:string;created_at:string};
async function read<T>(path:string,init?:RequestInit):Promise<T>{
 const r=await apiFetch(path,init);const d=await r.json();if(!r.ok)throw new Error(d.error||"ارتباط با سه‌سوته برقرار نشد.");return d as T;
}
export async function createStoreBuilderRequest(input:{business_name:string;contact_phone:string;store_model:"inside"|"independent";plan_code:"basic"|"pro"|"custom";description:string}){
 return read<{success:boolean;message:string;request:StoreBuilderRequest}>("/api/store-builder",{method:"POST",body:JSON.stringify(input)});
}
export async function getStoreMessages(requestId:number){
 return read<{messages:StoreMessage[]}>("/api/account/store-builder-messages?request_id="+requestId);
}
export async function sendStoreMessage(requestId:number,body:string){
 return read<{message:StoreMessage}>("/api/account/store-builder-messages",{method:"POST",body:JSON.stringify({request_id:requestId,body})});
}
export async function reviewStoreRequest(requestId:number,action:"approve"|"revision"|"approve_delivery",feedback=""){
 return read<{success:boolean;request:Partial<StoreBuilderRequest>}>("/api/account/store-builder-review",{method:"POST",body:JSON.stringify({request_id:requestId,action,feedback})});
}
