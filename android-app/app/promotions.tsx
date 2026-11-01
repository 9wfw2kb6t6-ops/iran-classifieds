import { useCallback,useEffect,useState } from "react";
import { ActivityIndicator,Alert,Pressable,RefreshControl,SafeAreaView,ScrollView,Text,View } from "react-native";
import { useRouter } from "expo-router";
import { getAccount,getPromotions,Listing,PromotionData,requestPromotion } from "../lib/api";
const ORANGE="#F47735",INK="#18343C";
const money=(n:number)=>Number(n||0).toLocaleString("fa-IR")+" تومان";
const states:Record<string,string>={pending:"در انتظار بررسی",approved:"تأیید شده",rejected:"رد شده"};
export default function PromotionsScreen(){
 const router=useRouter();const [data,setData]=useState<PromotionData|null>(null);const [listings,setListings]=useState<Listing[]>([]);
 const [loading,setLoading]=useState(true);const [busy,setBusy]=useState("");const [error,setError]=useState("");
 const load=useCallback(async()=>{try{const [p,a]=await Promise.all([getPromotions(),getAccount()]);setData(p);setListings(a.listings.filter(x=>x.status==="published"));setError("");}catch(e){setError(e instanceof Error?e.message:"دریافت اطلاعات ممکن نشد.");}finally{setLoading(false);}},[]);
 useEffect(()=>{void load();},[load]);
 async function request(id:number,type:"featured"|"bump"){const key=id+":"+type;setBusy(key);try{const r=await requestPromotion(id,type);Alert.alert("درخواست ثبت شد",r.message);await load();}catch(e){Alert.alert("سه‌سوته",e instanceof Error?e.message:"ثبت درخواست انجام نشد.");}finally{setBusy("");}}
 return <SafeAreaView style={{flex:1,backgroundColor:"#FFF8EF"}}><ScrollView contentContainerStyle={{padding:18,paddingBottom:40}} refreshControl={<RefreshControl refreshing={loading&&!data} onRefresh={()=>{setLoading(true);void load();}} tintColor={ORANGE}/>}>
 <Pressable onPress={()=>router.back()}><Text style={{textAlign:"right",color:ORANGE,fontWeight:"800"}}>← بازگشت</Text></Pressable>
 <Text style={{fontSize:23,fontWeight:"900",color:INK,textAlign:"right",marginTop:18}}>ویژه‌سازی آگهی‌ها</Text>
 {loading&&!data?<ActivityIndicator color={ORANGE} size="large" style={{marginTop:50}}/>:error?<Text style={{textAlign:"right",color:"#B42318",marginTop:20}}>{error}</Text>:data&&<>
 <View style={{backgroundColor:INK,borderRadius:16,padding:17,marginTop:17}}>
 <Text style={{color:"#F8D9C7",textAlign:"right"}}>موجودی کیف پول</Text><Text style={{color:"white",textAlign:"right",fontSize:23,fontWeight:"900",marginTop:5}}>{money(data.balance)}</Text>
 <View style={{flexDirection:"row",justifyContent:"space-between",marginTop:16}}><View><Text style={{color:"#F8D9C7",fontSize:11}}>نردبان</Text><Text style={{color:"white",fontWeight:"800"}}>{money(data.prices.bump)}</Text></View><View><Text style={{color:"#F8D9C7",fontSize:11}}>آگهی ویژه</Text><Text style={{color:"white",fontWeight:"800"}}>{money(data.prices.featured)}</Text></View></View>
 </View>
 <Text style={{textAlign:"right",fontSize:17,fontWeight:"900",color:INK,marginTop:24}}>آگهی‌های منتشرشده من</Text>
 {listings.length?listings.map(x=><View key={String(x.id)} style={{backgroundColor:"white",padding:14,borderRadius:14,marginTop:10}}>
 <Text style={{textAlign:"right",fontWeight:"900",color:INK}}>{x.title}</Text>
 <Text style={{textAlign:"right",fontSize:12,color:"#777",marginTop:5}}>{x.city} · {x.is_featured?"آگهی ویژه":"عادی"}</Text>
 <View style={{flexDirection:"row",gap:8,marginTop:13}}>
 <Pressable disabled={!!busy||!!x.is_featured} onPress={()=>request(Number(x.id),"featured")} style={{flex:1,backgroundColor:x.is_featured?"#EEE":"#FFF1E8",padding:11,borderRadius:9,opacity:busy?0.5:1}}><Text style={{textAlign:"center",color:INK,fontWeight:"800",fontSize:11}}>{busy===x.id+":featured"?"...":x.is_featured?"ویژه شده":"ویژه‌سازی"}</Text></Pressable>
 <Pressable disabled={!!busy} onPress={()=>request(Number(x.id),"bump")} style={{flex:1,backgroundColor:"#F2F0E9",padding:11,borderRadius:9,opacity:busy?0.5:1}}><Text style={{textAlign:"center",color:INK,fontWeight:"800",fontSize:11}}>{busy===x.id+":bump"?"...":"نردبان"}</Text></Pressable>
 </View>
 </View>):<Text style={{textAlign:"right",color:"#888",marginTop:10}}>آگهی منتشرشده‌ای برای ارتقا نداری.</Text>}
 <Text style={{textAlign:"right",fontSize:17,fontWeight:"900",color:INK,marginTop:24}}>درخواست‌های من</Text>
 {data.requests.length?data.requests.map(x=><View key={x.id} style={{backgroundColor:"white",padding:13,borderRadius:12,marginTop:8}}>
 <Text style={{textAlign:"right",fontWeight:"800",color:INK}}>{x.title}</Text><Text style={{textAlign:"right",fontSize:12,color:"#777",marginTop:5}}>{x.promotion_type==="featured"?"آگهی ویژه":"نردبان"} · {states[x.status]||x.status}</Text>{x.admin_note?<Text style={{textAlign:"right",fontSize:12,color:"#777",marginTop:5}}>یادداشت مدیر: {x.admin_note}</Text>:null}
 </View>):<Text style={{textAlign:"right",color:"#888",marginTop:10}}>درخواستی ثبت نشده است.</Text>}
 <Pressable onPress={()=>router.push("/wallet")} style={{backgroundColor:ORANGE,padding:14,borderRadius:12,marginTop:20}}><Text style={{color:"white",textAlign:"center",fontWeight:"900"}}>رفتن به کیف پول</Text></Pressable>
 </>}
 </ScrollView></SafeAreaView>;
}