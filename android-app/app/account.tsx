import { useCallback,useEffect,useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { deleteListing,getAccount,logout,Listing,User,updateListing } from "../lib/api";

const ORANGE="#F47735",INK="#18343C";
const status:Record<string,string>={pending:"در انتظار بررسی",published:"منتشرشده",rejected:"ردشده",sold:"فروخته‌شده",expired:"منقضی‌شده"};
const money=(n?:number|string|null)=>!n||Number(n)===0?"توافقی":Number(n).toLocaleString("fa-IR")+" تومان";
export default function AccountScreen(){
 const router=useRouter();const [user,setUser]=useState<User|null>(null);const [items,setItems]=useState<Listing[]>([]);
 const [loading,setLoading]=useState(true);const [refreshing,setRefreshing]=useState(false);const [error,setError]=useState("");
 const load=useCallback(async()=>{try{const d=await getAccount();setUser(d.user);setItems(d.listings||[]);setError("");}catch(e){setError(e instanceof Error?e.message:"دریافت حساب ممکن نشد.");}finally{setLoading(false);setRefreshing(false);}},[]);
 useEffect(()=>{void load();},[load]);
 async function signOut(){try{await logout();setUser(null);setItems([]);router.replace("/");}catch{Alert.alert("سه‌سوته","خروج انجام نشد.");}}
 async function remove(id:number){Alert.alert("حذف آگهی","آگهی برای همیشه حذف شود؟",[{text:"انصراف",style:"cancel"},{text:"حذف",style:"destructive",onPress:async()=>{try{await deleteListing(id);setItems(v=>v.filter(x=>Number(x.id)!==id));}catch(e){Alert.alert("خطا",e instanceof Error?e.message:"حذف انجام نشد.");}}}]);}
 async function markSold(id:number){try{await updateListing(id,{action:"sold"});await load();}catch(e){Alert.alert("خطا",e instanceof Error?e.message:"تغییر وضعیت انجام نشد.");}}
 if(loading)return <SafeAreaView style={{flex:1,backgroundColor:"#FFF8EF",justifyContent:"center"}}><ActivityIndicator color={ORANGE} size="large"/></SafeAreaView>;
 return <SafeAreaView style={{flex:1,backgroundColor:"#FFF8EF"}}>
 <ScrollView contentContainerStyle={{padding:18,paddingBottom:40}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true);void load();}} tintColor={ORANGE}/>}>
 <Pressable onPress={()=>router.back()}><Text style={{color:ORANGE,textAlign:"right",fontWeight:"700"}}>← بازگشت</Text></Pressable>
 <Text style={{fontSize:25,fontWeight:"900",color:INK,textAlign:"right",marginTop:18}}>حساب کاربری من</Text>
 {error? <Text style={{color:"#B42318",textAlign:"right",marginTop:18}}>{error}</Text>:null}
 {!user?<View style={{backgroundColor:"white",padding:20,borderRadius:18,marginTop:20}}>
   <Text style={{fontSize:16,fontWeight:"800",textAlign:"right",color:INK}}>برای دیدن آگهی‌ها وارد حساب شو</Text>
   <Pressable onPress={()=>router.push("/login")} style={{backgroundColor:ORANGE,padding:14,borderRadius:12,marginTop:16}}><Text style={{color:"white",textAlign:"center",fontWeight:"800"}}>ورود یا ثبت‌نام</Text></Pressable>
 </View>:<>
 <View style={{backgroundColor:INK,borderRadius:18,padding:18,marginTop:20}}>
  <Text style={{color:"white",fontSize:18,fontWeight:"900",textAlign:"right"}}>{user.display_name||"خوش اومدی!"}</Text>
  <Text style={{color:"#F8D9C7",textAlign:"right",marginTop:5}}>{user.phone}</Text>
  <Pressable onPress={signOut} style={{alignSelf:"flex-end",marginTop:14,backgroundColor:"#FFFFFF20",paddingHorizontal:14,paddingVertical:9,borderRadius:10}}><Text style={{color:"white",fontWeight:"700"}}>خروج از حساب</Text></Pressable>
 </View>
 <View style={{flexDirection:"row",gap:8,marginTop:14}}>
  <Pressable onPress={()=>router.push("/store-builder")} style={{flex:1,backgroundColor:"white",padding:13,borderRadius:12}}><Text style={{textAlign:"center",fontWeight:"800",color:INK}}>فروشگاه‌ساز</Text></Pressable>
  <Pressable onPress={()=>router.push("/wallet")} style={{flex:1,backgroundColor:"white",padding:13,borderRadius:12}}><Text style={{textAlign:"center",fontWeight:"800",color:INK}}>کیف پول</Text></Pressable>
  <Pressable onPress={()=>router.push("/promotions")} style={{flex:1,backgroundColor:"white",padding:13,borderRadius:12}}><Text style={{textAlign:"center",fontWeight:"800",color:INK}}>ویژه‌سازی</Text></Pressable>
 </View>
 
 <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:25}}>
  <Text style={{color:ORANGE,fontWeight:"800"}}>{items.length.toLocaleString("fa-IR")} آگهی</Text>
  <Text style={{fontSize:19,fontWeight:"900",color:INK}}>آگهی‌های من</Text>
 </View>
 <Pressable onPress={()=>router.push("/post-ad")} style={{backgroundColor:ORANGE,padding:14,borderRadius:12,marginTop:12}}><Text style={{color:"white",fontWeight:"900",textAlign:"center"}}>＋ ثبت آگهی جدید</Text></Pressable>
 {items.map(x=><View key={String(x.id)} style={{backgroundColor:"white",borderRadius:15,padding:14,marginTop:12,borderWidth:1,borderColor:"#F0E9DF"}}>
  <Text style={{textAlign:"right",fontWeight:"900",fontSize:15,color:INK}}>{x.title}</Text>
  <Text style={{textAlign:"right",fontSize:12,color:"#777",marginTop:5}}>{x.city} · {x.category}</Text>
  <View style={{flexDirection:"row",justifyContent:"space-between",marginTop:9}}><Text style={{fontSize:12,color:ORANGE,fontWeight:"800"}}>{money(x.price_toman)}</Text><Text style={{fontSize:12,color:"#666"}}>{status[String(x.status)]||x.status}</Text></View>
  <View style={{flexDirection:"row",gap:8,marginTop:13}}>
   <Pressable onPress={()=>router.push(("/ads/"+x.id) as never)} style={{flex:1,borderWidth:1,borderColor:"#E8DED3",padding:10,borderRadius:9}}><Text style={{textAlign:"center",fontSize:12,fontWeight:"700",color:INK}}>مشاهده</Text></Pressable>
   {x.status==="published"&&<Pressable onPress={()=>markSold(Number(x.id))} style={{flex:1,borderWidth:1,borderColor:"#E8DED3",padding:10,borderRadius:9}}><Text style={{textAlign:"center",fontSize:12,fontWeight:"700",color:INK}}>فروخته شد</Text></Pressable>}
   <Pressable onPress={()=>remove(Number(x.id))} style={{flex:1,borderWidth:1,borderColor:"#F2C7C3",padding:10,borderRadius:9}}><Text style={{textAlign:"center",fontSize:12,fontWeight:"700",color:"#B42318"}}>حذف</Text></Pressable>
  </View>
 </View>)}
 </>}
 </ScrollView></SafeAreaView>;
}