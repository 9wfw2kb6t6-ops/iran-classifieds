import { useCallback,useEffect,useState } from "react";
import { ActivityIndicator,Alert,Pressable,RefreshControl,SafeAreaView,ScrollView,Text,View } from "react-native";
import { useRouter } from "expo-router";
import { getWallet,requestWalletTopup,WalletData } from "../lib/api";
const ORANGE="#F47735",INK="#18343C";
const money=(n:number)=>Number(n||0).toLocaleString("fa-IR")+" تومان";
const states:Record<string,string>={pending:"در انتظار بررسی",approved:"تأیید شده",rejected:"رد شده"};
export default function WalletScreen(){
 const router=useRouter();const [data,setData]=useState<WalletData|null>(null);const [loading,setLoading]=useState(true);const [busy,setBusy]=useState("");const [error,setError]=useState("");
 const load=useCallback(async()=>{try{setData(await getWallet());setError("");}catch(e){setError(e instanceof Error?e.message:"دریافت کیف پول ممکن نشد.");}finally{setLoading(false);}},[]);
 useEffect(()=>{void load();},[load]);
 async function topup(code:string){setBusy(code);try{const r=await requestWalletTopup(code);Alert.alert("درخواست ثبت شد",r.message);await load();}catch(e){Alert.alert("سه‌سوته",e instanceof Error?e.message:"ثبت درخواست انجام نشد.");}finally{setBusy("");}}
 return <SafeAreaView style={{flex:1,backgroundColor:"#FFF8EF"}}><ScrollView contentContainerStyle={{padding:18,paddingBottom:40}} refreshControl={<RefreshControl refreshing={loading&&!data} onRefresh={()=>{setLoading(true);void load();}} tintColor={ORANGE}/>}>
 <Pressable onPress={()=>router.back()}><Text style={{textAlign:"right",color:ORANGE,fontWeight:"800"}}>← بازگشت</Text></Pressable>
 <Text style={{fontSize:24,fontWeight:"900",color:INK,textAlign:"right",marginTop:18}}>کیف پول سه‌سوته</Text>
 {loading&&!data?<ActivityIndicator color={ORANGE} size="large" style={{marginTop:50}}/>:error?<Text style={{textAlign:"right",color:"#B42318",marginTop:20}}>{error}</Text>:data&&<>
 <View style={{backgroundColor:INK,borderRadius:18,padding:20,marginTop:18}}>
 <Text style={{color:"#F8D9C7",textAlign:"right",fontWeight:"700"}}>موجودی فعلی</Text>
 <Text style={{color:"white",textAlign:"right",fontWeight:"900",fontSize:27,marginTop:8}}>{money(data.balance)}</Text>
 </View>
 <Text style={{textAlign:"right",fontSize:18,fontWeight:"900",color:INK,marginTop:25}}>درخواست شارژ کیف پول</Text>
 <Text style={{textAlign:"right",fontSize:12,color:"#777",lineHeight:22,marginTop:5}}>درخواست شارژ مانند سایت ثبت می‌شود. تا زمان تأیید مدیر و راه‌اندازی درگاه، هیچ پرداختی انجام نده.</Text>
 {data.packages.map(p=><View key={p.code} style={{backgroundColor:"white",borderRadius:14,padding:15,marginTop:10,flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}>
 <Pressable disabled={!!busy} onPress={()=>topup(p.code)} style={{backgroundColor:ORANGE,paddingHorizontal:14,paddingVertical:10,borderRadius:10,opacity:busy?0.6:1}}>{busy===p.code?<ActivityIndicator color="white"/>:<Text style={{color:"white",fontWeight:"800",fontSize:12}}>درخواست شارژ</Text>}</Pressable>
 <View><Text style={{textAlign:"right",fontWeight:"900",color:INK}}>{p.title}</Text><Text style={{textAlign:"right",color:ORANGE,fontWeight:"800",marginTop:4}}>{money(p.amount)}</Text></View>
 </View>)}
 <Text style={{textAlign:"right",fontSize:17,fontWeight:"900",color:INK,marginTop:25}}>درخواست‌های شارژ</Text>
 {data.requests.length?data.requests.map(x=><View key={x.id} style={{backgroundColor:"white",padding:14,borderRadius:12,marginTop:9}}>
 <Text style={{textAlign:"right",fontWeight:"800",color:INK}}>{money(x.amount_toman)}</Text><Text style={{textAlign:"right",fontSize:12,color:"#777",marginTop:5}}>{states[x.status]||x.status}</Text>{x.admin_note?<Text style={{textAlign:"right",fontSize:12,color:"#777",marginTop:5}}>یادداشت مدیر: {x.admin_note}</Text>:null}
 </View>):<Text style={{textAlign:"right",color:"#888",marginTop:10}}>هنوز درخواستی ثبت نشده است.</Text>}
 <Text style={{textAlign:"right",fontSize:17,fontWeight:"900",color:INK,marginTop:25}}>تراکنش‌ها</Text>
 {data.transactions.length?data.transactions.map(x=><View key={x.id} style={{backgroundColor:"white",padding:13,borderRadius:12,marginTop:8,flexDirection:"row",justifyContent:"space-between"}}><Text style={{color:Number(x.amount_toman)<0?"#B42318":"#16834A",fontWeight:"800"}}>{money(x.amount_toman)}</Text><Text style={{color:INK,fontSize:12,flex:1,textAlign:"right",marginLeft:12}}>{x.description}</Text></View>):<Text style={{textAlign:"right",color:"#888",marginTop:10}}>تراکنشی ثبت نشده است.</Text>}
 </>}
 </ScrollView></SafeAreaView>;
}