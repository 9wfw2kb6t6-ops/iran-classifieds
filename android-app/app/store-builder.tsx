import { useCallback,useEffect,useState } from "react";
import { ActivityIndicator,Alert,Linking,Pressable,SafeAreaView,ScrollView,Text,TextInput,View } from "react-native";
import { useRouter } from "expo-router";
import { getAccount } from "../lib/api";
import { createStoreBuilderRequest,getStoreMessages,reviewStoreRequest,sendStoreMessage,StoreBuilderRequest,StoreMessage } from "../lib/store-builder-api";
const O="#F47735",I="#18343C";
const plans={inside:[{id:"basic",name:"فروشگاه عادی",price:"۴ میلیون تومان"},{id:"pro",name:"فروشگاه حرفه‌ای",price:"۸ میلیون تومان"},{id:"custom",name:"فروشگاه اختصاصی",price:"از ۱۵ میلیون تومان"}],independent:[{id:"basic",name:"سایت فروشگاهی پایه",price:"۸ میلیون تومان"},{id:"pro",name:"سایت فروشگاهی حرفه‌ای",price:"۱۵ میلیون تومان"},{id:"custom",name:"سایت فروشگاهی اختصاصی",price:"از ۲۵ میلیون تومان"}]};
const status:Record<string,string>={pending:"در انتظار بررسی",quoted:"اعلام قیمت",awaiting_prepayment:"در انتظار پیش‌پرداخت",prepayment_pending:"در انتظار تأیید پیش‌پرداخت",customer_review:"در انتظار تأیید طرح",building:"در حال ساخت",revision:"در حال اصلاح",delivery_review:"در انتظار تأیید تحویل",delivered:"تحویل‌شده",cancelled:"لغوشده"};
const money=(n:number|null)=>n?Number(n).toLocaleString("fa-IR")+" تومان":"اعلام نشده";
export default function StoreBuilderScreen(){
 const router=useRouter();const [kind,setKind]=useState<"inside"|"independent">("inside");const [plan,setPlan]=useState<"basic"|"pro"|"custom">("basic");
 const [business,setBusiness]=useState("");const [phone,setPhone]=useState("");const [description,setDescription]=useState("");const [busy,setBusy]=useState(false);
 const [requests,setRequests]=useState<StoreBuilderRequest[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 const [active,setActive]=useState<number|null>(null);const [messages,setMessages]=useState<StoreMessage[]>([]);const [message,setMessage]=useState("");const [feedback,setFeedback]=useState("");const [messageBusy,setMessageBusy]=useState(false);
 const load=useCallback(async()=>{try{const a=await getAccount();setRequests((a.store_builder_requests||[]) as StoreBuilderRequest[]);setError("");}catch(e){setError(e instanceof Error?e.message:"دریافت درخواست‌ها ممکن نشد.");}finally{setLoading(false);}},[]);
 useEffect(()=>{void load();},[load]);
 async function submit(){setBusy(true);setError("");try{const r=await createStoreBuilderRequest({business_name:business,contact_phone:phone,store_model:kind,plan_code:plan,description});Alert.alert("درخواست ثبت شد",r.message);setBusiness("");setPhone("");setDescription("");await load();}catch(e){setError(e instanceof Error?e.message:"ثبت درخواست انجام نشد.");}finally{setBusy(false);}}
 async function openMessages(id:number){setActive(id);setMessages([]);try{const d=await getStoreMessages(id);setMessages(d.messages);}catch(e){Alert.alert("پیام‌ها",e instanceof Error?e.message:"دریافت پیام‌ها ممکن نشد.");}}
 async function send(){if(!active||!message.trim())return;setMessageBusy(true);try{const d=await sendStoreMessage(active,message.trim());setMessages(v=>[...v,d.message]);setMessage("");}catch(e){Alert.alert("خطا",e instanceof Error?e.message:"ارسال پیام انجام نشد.");}finally{setMessageBusy(false);}}
 async function review(id:number,action:"approve"|"revision"|"approve_delivery"){try{await reviewStoreRequest(id,action,feedback);setFeedback("");Alert.alert("ثبت شد","پاسخ شما ثبت شد.");await load();}catch(e){Alert.alert("خطا",e instanceof Error?e.message:"ثبت پاسخ انجام نشد.");}}
 const field={backgroundColor:"white",borderWidth:1,borderColor:"#E9E2D9",borderRadius:12,padding:13,fontSize:14,color:I,marginTop:7} as const;
 return <SafeAreaView style={{flex:1,backgroundColor:"#FFF8EF"}}><ScrollView contentContainerStyle={{padding:18,paddingBottom:40}}>
 <Pressable onPress={()=>router.back()}><Text style={{textAlign:"right",color:O,fontWeight:"800"}}>← بازگشت</Text></Pressable>
 <Text style={{fontSize:24,fontWeight:"900",color:I,textAlign:"right",marginTop:18}}>فروشگاه‌ساز سه‌سوته</Text>
 <Text style={{textAlign:"right",fontSize:12,color:"#777",lineHeight:22,marginTop:5}}>درخواست ساخت فروشگاه داخل سه‌سوته یا سایت مستقل را ثبت و مراحل آن را از همین‌جا پیگیری کن.</Text>
 <View style={{backgroundColor:"white",borderRadius:17,padding:15,marginTop:17}}>
 <Text style={{textAlign:"right",fontWeight:"900",color:I}}>نوع فروشگاه</Text>
 <View style={{flexDirection:"row",gap:8,marginTop:10}}>{[{id:"inside",label:"داخل سه‌سوته"},{id:"independent",label:"سایت مستقل"}].map(x=><Pressable key={x.id} onPress={()=>setKind(x.id as "inside"|"independent")} style={{flex:1,backgroundColor:kind===x.id?O:"#F4EEE7",padding:12,borderRadius:11}}><Text style={{textAlign:"center",color:kind===x.id?"white":I,fontWeight:"800",fontSize:12}}>{x.label}</Text></Pressable>)}</View>
 <Text style={{textAlign:"right",fontWeight:"900",color:I,marginTop:17}}>انتخاب طرح</Text>
 {plans[kind].map(p=><Pressable key={p.id} onPress={()=>setPlan(p.id as "basic"|"pro"|"custom")} style={{borderWidth:1,borderColor:plan===p.id?O:"#EEE3D8",backgroundColor:plan===p.id?"#FFF4EB":"white",borderRadius:11,padding:12,marginTop:8,flexDirection:"row",justifyContent:"space-between"}}><Text style={{fontSize:12,color:O,fontWeight:"800"}}>{p.price}</Text><Text style={{fontSize:12,color:I,fontWeight:"800"}}>{p.name} {plan===p.id?"✓":""}</Text></Pressable>)}
 <Text style={{textAlign:"right",fontWeight:"800",color:I,marginTop:16}}>نام کسب‌وکار</Text><TextInput value={business} onChangeText={setBusiness} placeholder="نام فروشگاه یا کسب‌وکار" placeholderTextColor="#999" textAlign="right" style={field}/>
 <Text style={{textAlign:"right",fontWeight:"800",color:I,marginTop:13}}>شماره تماس</Text><TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="09123456789" placeholderTextColor="#999" textAlign="left" style={field}/>
 <Text style={{textAlign:"right",fontWeight:"800",color:I,marginTop:13}}>توضیحات</Text><TextInput value={description} onChangeText={setDescription} multiline textAlignVertical="top" placeholder="نیازها و امکانات موردنظرت را بنویس..." placeholderTextColor="#999" style={[field,{minHeight:90}]}/>
 <Pressable disabled={busy} onPress={submit} style={{backgroundColor:O,padding:14,borderRadius:12,marginTop:17,opacity:busy?.6:1}}><Text style={{textAlign:"center",color:"white",fontWeight:"900"}}>{busy?"در حال ثبت...":"ثبت درخواست فروشگاه"}</Text></Pressable>
 </View>
 <Text style={{textAlign:"right",fontSize:18,fontWeight:"900",color:I,marginTop:25}}>درخواست‌های من</Text>
 {loading?<ActivityIndicator color={O} style={{marginTop:20}}/>:error?<Text style={{textAlign:"right",color:"#B42318",marginTop:10}}>{error}</Text>:requests.length?requests.map(x=><View key={x.id} style={{backgroundColor:"white",padding:14,borderRadius:14,marginTop:10}}>
 <Text style={{textAlign:"right",fontWeight:"900",color:I}}>{x.business_name}</Text>
 <Text style={{textAlign:"right",fontSize:12,color:"#777",marginTop:5}}>{x.store_model==="inside"?"فروشگاه داخل سه‌سوته":"سایت مستقل"} · {x.plan_code==="basic"?"پایه":x.plan_code==="pro"?"حرفه‌ای":"اختصاصی"}</Text>
 <Text style={{textAlign:"right",fontSize:12,color:O,fontWeight:"800",marginTop:7}}>{status[x.status]||x.status}</Text>
 <Text style={{textAlign:"right",fontSize:12,color:"#666",marginTop:6}}>قیمت اعلام‌شده: {money(x.quoted_price_toman)} · پیش‌پرداخت: {money(x.prepayment_amount_toman)}</Text>
 {x.admin_note?<Text style={{textAlign:"right",fontSize:12,color:"#777",marginTop:7}}>یادداشت مدیر: {x.admin_note}</Text>:null}
 {x.deliverable_url?<Pressable onPress={()=>x.deliverable_url&&Linking.openURL(x.deliverable_url)}><Text style={{textAlign:"right",color:O,fontWeight:"800",marginTop:7}}>لینک تحویل: {x.deliverable_url}</Text></Pressable>:null}
 <Pressable onPress={()=>void openMessages(x.id)} style={{backgroundColor:"#F3F0EA",padding:11,borderRadius:9,marginTop:11}}><Text style={{textAlign:"center",fontWeight:"800",color:I}}>گفت‌وگو با تیم سه‌سوته</Text></Pressable>
 {active===x.id?<View style={{marginTop:10,backgroundColor:"#FFF8EF",borderRadius:10,padding:10}}>
 {messages.map(m=><View key={m.id} style={{alignSelf:m.sender_role==="user"?"flex-start":"flex-end",backgroundColor:m.sender_role==="user"?"#E7F1F2":"white",padding:9,borderRadius:9,maxWidth:"90%",marginTop:5}}><Text style={{textAlign:"right",fontSize:12,color:I}}>{m.body}</Text></View>)}
 <TextInput value={message} onChangeText={setMessage} placeholder="پیامت را بنویس..." placeholderTextColor="#999" textAlign="right" style={field}/>
 <Pressable disabled={messageBusy||!message.trim()} onPress={send} style={{backgroundColor:O,padding:10,borderRadius:9,marginTop:7}}><Text style={{textAlign:"center",color:"white",fontWeight:"800"}}>{messageBusy?"...":"ارسال پیام"}</Text></Pressable>
 </View>:null}
 {x.status==="customer_review"||x.status==="delivery_review"?<View style={{marginTop:12}}>
 <TextInput value={feedback} onChangeText={setFeedback} multiline placeholder="اگر اصلاحی لازم است، توضیح بده..." placeholderTextColor="#999" textAlign="right" style={[field,{minHeight:65}]}/>
 <View style={{flexDirection:"row",gap:7,marginTop:8}}>
 <Pressable onPress={()=>review(x.id,x.status==="customer_review"?"approve":"approve_delivery")} style={{flex:1,backgroundColor:"#16834A",padding:10,borderRadius:9}}><Text style={{color:"white",textAlign:"center",fontWeight:"800",fontSize:11}}>{x.status==="customer_review"?"تأیید طرح":"تأیید تحویل"}</Text></Pressable>
 <Pressable onPress={()=>review(x.id,"revision")} style={{flex:1,backgroundColor:"#F4EEE7",padding:10,borderRadius:9}}><Text style={{color:I,textAlign:"center",fontWeight:"800",fontSize:11}}>درخواست اصلاح</Text></Pressable>
 </View></View>:null}
 </View>):<Text style={{textAlign:"right",color:"#888",marginTop:10}}>هنوز درخواستی ثبت نکرده‌ای.</Text>}
 </ScrollView></SafeAreaView>;
}