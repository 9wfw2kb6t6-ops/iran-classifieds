import { useCallback,useEffect,useState } from "react";
import { ActivityIndicator,Alert,Pressable,RefreshControl,SafeAreaView,ScrollView,Text,TextInput,View } from "react-native";
import { adminJson,adminLogin,adminLogout,hasAdminSession } from "../lib/admin-api";
const O="#F47735",I="#18343C",BG="#FFF8EF";
type Tab="pending"|"published"|"archive"|"reports"|"wallet"|"promotions"|"stores";
type Row=Record<string,any>;
const tabs:{id:Tab;label:string;endpoint:string;key:string}[]=[
 {id:"pending",label:"آگهی‌های در انتظار",endpoint:"/api/admin/listings?status=pending",key:"listings"},
 {id:"published",label:"آگهی‌های منتشرشده",endpoint:"/api/admin/listings?status=published",key:"listings"},
 {id:"archive",label:"بایگانی آگهی‌ها",endpoint:"/api/admin/listings?status=archive",key:"listings"},
 {id:"reports",label:"گزارش تخلف",endpoint:"/api/admin/reports",key:"reports"},
 {id:"wallet",label:"درخواست شارژ",endpoint:"/api/admin/wallet",key:"requests"},
 {id:"promotions",label:"درخواست ویژه‌سازی",endpoint:"/api/admin/promotions",key:"requests"},
 {id:"stores",label:"فروشگاه‌ساز",endpoint:"/api/admin/store-builder",key:"requests"}
];
const fa=(v:any)=>Number(v||0).toLocaleString("fa-IR");
export default function AdminScreen(){
 const [ready,setReady]=useState(false),[logged,setLogged]=useState(false),[password,setPassword]=useState(""),[busy,setBusy]=useState(false),[refreshing,setRefreshing]=useState(false),[message,setMessage]=useState("");
 const [tab,setTab]=useState<Tab>("pending"),[rows,setRows]=useState<Row[]>([]);
 const [notes,setNotes]=useState<Record<string,string>>({});
 const current=tabs.find(x=>x.id===tab)!;
 const load=useCallback(async()=>{setMessage("");try{const d=await adminJson<Record<string,Row[]>>(current.endpoint);setRows(d[current.key]||[]);}catch(e){const msg=e instanceof Error?e.message:"دریافت اطلاعات انجام نشد.";setMessage(msg);setRows([]);if(msg.includes("ابتدا وارد پنل مدیریت")){await adminLogout();setLogged(false);}}},[current]);
 useEffect(()=>{hasAdminSession().then(v=>{setLogged(v);setReady(true);});},[]);
 useEffect(()=>{if(logged)void load();},[logged,load]);
 async function login(){setBusy(true);setMessage("");try{await adminLogin(password);setPassword("");setLogged(true);}catch(e){setMessage(e instanceof Error?e.message:"ورود انجام نشد.");}finally{setBusy(false);}}
 async function signOut(){await adminLogout();setLogged(false);setRows([]);}
 async function act(path:string,body:Row,success:string){setBusy(true);try{await adminJson(path,{method:"PATCH",body:JSON.stringify(body)});Alert.alert("انجام شد",success);await load();}catch(e){Alert.alert("خطا",e instanceof Error?e.message:"عملیات انجام نشد.");}finally{setBusy(false);}}
 const refresh=async()=>{setRefreshing(true);await load();setRefreshing(false);};
 const card=(r:Row)=>{const id=String(r.id);const title=r.title||r.listing_title||r.business_name||("درخواست شماره "+id);const meta=[r.city||r.listing_city,r.contact_phone,r.phone,r.category].filter(Boolean).join(" · ");
 return <View key={id} style={{backgroundColor:"white",padding:14,borderRadius:15,marginBottom:10,borderWidth:1,borderColor:"#F0E9E0"}}>
 <Text style={{textAlign:"right",fontWeight:"900",fontSize:15,color:I}}>{title}</Text>
 {meta?<Text style={{textAlign:"right",fontSize:11,color:"#777",marginTop:6}}>{meta}</Text>:null}
 {r.description?<Text style={{textAlign:"right",fontSize:12,color:"#555",marginTop:8,lineHeight:22}}>{r.description}</Text>:null}
 {r.price_toman!==undefined?<Text style={{textAlign:"right",color:O,fontWeight:"900",marginTop:7}}>{fa(r.price_toman)} تومان</Text>:null}
 {r.amount_toman!==undefined?<Text style={{textAlign:"right",color:O,fontWeight:"900",marginTop:7}}>{fa(r.amount_toman)} تومان</Text>:null}
 {r.quoted_price_toman!==undefined&&r.quoted_price_toman!==null?<Text style={{textAlign:"right",color:O,fontWeight:"800",marginTop:6}}>قیمت پیشنهادی: {fa(r.quoted_price_toman)} تومان</Text>:null}
 {r.reason?<Text style={{textAlign:"right",fontSize:12,color:"#8B3028",marginTop:7}}>دلیل گزارش: {r.reason} {r.details||""}</Text>:null}
 {r.status?<Text style={{textAlign:"right",fontSize:11,color:"#777",marginTop:6}}>وضعیت: {r.status}</Text>:null}
 {tab==="pending"?<View style={{flexDirection:"row",gap:8,marginTop:12}}><Pressable disabled={busy} onPress={()=>act("/api/admin/listings",{id:Number(r.id),status:"published"},"آگهی منتشر شد.")} style={{flex:1,backgroundColor:"#E5F5EB",padding:11,borderRadius:10}}><Text style={{textAlign:"center",fontWeight:"900",color:"#176B3A"}}>تأیید و انتشار</Text></Pressable><Pressable disabled={busy} onPress={()=>act("/api/admin/listings",{id:Number(r.id),status:"rejected"},"آگهی رد شد.")} style={{flex:1,backgroundColor:"#FFF0EF",padding:11,borderRadius:10}}><Text style={{textAlign:"center",fontWeight:"900",color:"#A52A22"}}>رد آگهی</Text></Pressable></View>:null}
 {tab==="reports"?<View style={{flexDirection:"row",gap:7,marginTop:12}}>{[{s:"reviewing",l:"در حال بررسی"},{s:"resolved",l:"رسیدگی شد"},{s:"dismissed",l:"رد گزارش"}].map(x=><Pressable key={x.s} disabled={busy} onPress={()=>act("/api/admin/reports",{id:Number(r.id),status:x.s},"وضعیت گزارش به‌روزرسانی شد.")} style={{flex:1,backgroundColor:"#F2F3F3",padding:9,borderRadius:9}}><Text style={{textAlign:"center",fontSize:10,fontWeight:"800",color:I}}>{x.l}</Text></Pressable>)}</View>:null}
 {tab==="wallet"?<View style={{flexDirection:"row",gap:8,marginTop:12}}><Pressable disabled={busy} onPress={()=>act("/api/admin/wallet",{id:Number(r.id),decision:"approved"},"شارژ کیف پول تأیید شد.")} style={{flex:1,backgroundColor:"#E5F5EB",padding:11,borderRadius:10}}><Text style={{textAlign:"center",fontWeight:"900",color:"#176B3A"}}>تأیید شارژ</Text></Pressable><Pressable disabled={busy} onPress={()=>act("/api/admin/wallet",{id:Number(r.id),decision:"rejected"},"درخواست شارژ رد شد.")} style={{flex:1,backgroundColor:"#FFF0EF",padding:11,borderRadius:10}}><Text style={{textAlign:"center",fontWeight:"900",color:"#A52A22"}}>رد درخواست</Text></Pressable></View>:null}
 {tab==="promotions"?<View style={{flexDirection:"row",gap:8,marginTop:12}}><Pressable disabled={busy} onPress={()=>act("/api/admin/promotions",{id:Number(r.id),decision:"approved"},"درخواست ویژه‌سازی تأیید شد.")} style={{flex:1,backgroundColor:"#E5F5EB",padding:11,borderRadius:10}}><Text style={{textAlign:"center",fontWeight:"900",color:"#176B3A"}}>تأیید</Text></Pressable><Pressable disabled={busy} onPress={()=>act("/api/admin/promotions",{id:Number(r.id),decision:"rejected"},"هزینه درخواست به کیف پول برگشت.")} style={{flex:1,backgroundColor:"#FFF0EF",padding:11,borderRadius:10}}><Text style={{textAlign:"center",fontWeight:"900",color:"#A52A22"}}>رد و بازگشت وجه</Text></Pressable></View>:null}
 {tab==="stores"?<View style={{marginTop:12}}>
 <TextInput value={notes[id]??r.admin_note??""} onChangeText={v=>setNotes(s=>({...s,[id]:v}))} placeholder="یادداشت مدیر" placeholderTextColor="#999" multiline textAlign="right" style={{backgroundColor:BG,borderRadius:9,padding:10,minHeight:55,color:I}}/>
 <View style={{flexDirection:"row",flexWrap:"wrap",gap:6,marginTop:9}}>{[{s:"contacted",l:"تماس گرفته شد"},{s:"quoted",l:"ارسال قیمت"},{s:"building",l:"در حال ساخت"},{s:"delivered",l:"تحویل شد"},{s:"rejected",l:"رد درخواست"}].map(x=><Pressable key={x.s} disabled={busy} onPress={()=>act("/api/admin/store-builder",{id:Number(r.id),status:x.s,admin_note:notes[id]??r.admin_note??""},"وضعیت درخواست فروشگاه تغییر کرد.")} style={{backgroundColor:"#F1F2F2",padding:9,borderRadius:8}}><Text style={{fontSize:10,fontWeight:"800",color:I}}>{x.l}</Text></Pressable>)}</View>
 </View>:null}
 </View>};
 if(!ready)return <SafeAreaView style={{flex:1,backgroundColor:BG,alignItems:"center",justifyContent:"center"}}><ActivityIndicator color={O}/></SafeAreaView>;
 if(!logged)return <SafeAreaView style={{flex:1,backgroundColor:BG,justifyContent:"center",padding:22}}><View style={{backgroundColor:"white",padding:22,borderRadius:18}}>
 <Text style={{fontSize:24,fontWeight:"900",color:I,textAlign:"right"}}>مدیریت سه‌سوته</Text><Text style={{fontSize:13,color:"#777",textAlign:"right",lineHeight:23,marginTop:8}}>ورود فقط برای مدیر اصلی مجاز است.</Text>
 <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="رمز مدیریت" placeholderTextColor="#999" textAlign="right" style={{backgroundColor:BG,borderRadius:11,padding:14,marginTop:18,color:I}}/>
 {message?<Text style={{color:"#B42318",textAlign:"right",marginTop:10}}>{message}</Text>:null}
 <Pressable disabled={busy||!password} onPress={login} style={{backgroundColor:O,padding:14,borderRadius:11,marginTop:14,opacity:busy||!password?0.5:1}}><Text style={{color:"white",textAlign:"center",fontWeight:"900"}}>{busy?"در حال ورود...":"ورود مدیر"}</Text></Pressable>
 </View></SafeAreaView>;
 return <SafeAreaView style={{flex:1,backgroundColor:BG}}>
 <View style={{paddingHorizontal:16,paddingTop:12,paddingBottom:8,flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}><Pressable onPress={signOut}><Text style={{color:"#B42318",fontWeight:"800"}}>خروج</Text></Pressable><View><Text style={{fontSize:20,fontWeight:"900",color:I,textAlign:"right"}}>پنل مدیریت</Text><Text style={{fontSize:11,color:"#777",textAlign:"right"}}>سه‌سوته · دسترسی مدیر اصلی</Text></View></View>
 <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:12,paddingVertical:8,gap:7}}>{tabs.map(x=><Pressable key={x.id} onPress={()=>setTab(x.id)} style={{paddingHorizontal:13,paddingVertical:10,borderRadius:10,backgroundColor:tab===x.id?O:"white"}}><Text style={{fontSize:11,fontWeight:"800",color:tab===x.id?"white":I}}>{x.label}</Text></Pressable>)}</ScrollView>
 {message?<Text style={{marginHorizontal:16,color:"#B42318",textAlign:"right"}}>{message}</Text>:null}
 <ScrollView contentContainerStyle={{padding:14,paddingBottom:30}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={O}/>}>
 {rows.length?rows.map(card):<View style={{backgroundColor:"white",padding:30,borderRadius:14,alignItems:"center"}}><Text style={{color:"#777",textAlign:"center"}}>موردی برای نمایش وجود ندارد.</Text></View>}
 </ScrollView>
 </SafeAreaView>;
}
