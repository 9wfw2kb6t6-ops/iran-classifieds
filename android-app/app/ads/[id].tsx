import { useEffect,useState } from "react";
import { ActivityIndicator, Image, Linking, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams,useRouter } from "expo-router";
import { getListing,Listing } from "../../lib/api";
const ORANGE="#F47735",INK="#18343C";
const money=(n?:number|string|null)=>!n||Number(n)===0?"توافقی":Number(n).toLocaleString("fa-IR")+" تومان";
export default function ListingDetail(){
 const {id}=useLocalSearchParams<{id:string}>();const router=useRouter();
 const [item,setItem]=useState<Listing|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 useEffect(()=>{let active=true;getListing(String(id)).then(x=>{if(active)setItem(x);}).catch(e=>{if(active)setError(e instanceof Error?e.message:"آگهی پیدا نشد.");}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[id]);
 return <SafeAreaView style={{flex:1,backgroundColor:"#FFF8EF"}}><ScrollView contentContainerStyle={{padding:16,paddingBottom:35}}>
 <Pressable onPress={()=>router.back()}><Text style={{color:ORANGE,textAlign:"right",fontWeight:"800"}}>← بازگشت</Text></Pressable>
 {loading?<ActivityIndicator color={ORANGE} size="large" style={{marginTop:70}}/>:error?<Text style={{textAlign:"center",color:"#B42318",marginTop:40}}>{error}</Text>:item?<>
 {item.image_urls?.length?<ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{marginTop:16}}>{item.image_urls.map((uri,i)=><Image key={uri+i} source={{uri}} style={{width:320,height:250,borderRadius:16,marginRight:8,backgroundColor:"#eee"}} resizeMode="cover"/>)}</ScrollView>:<View style={{height:190,backgroundColor:"#F0EAE1",borderRadius:16,alignItems:"center",justifyContent:"center",marginTop:16}}><Text style={{color:"#999"}}>بدون تصویر</Text></View>}
 <View style={{backgroundColor:"white",padding:18,borderRadius:17,marginTop:15}}>
 <Text style={{textAlign:"right",fontSize:21,fontWeight:"900",color:INK,lineHeight:32}}>{item.title}</Text>
 <Text style={{textAlign:"right",fontSize:20,fontWeight:"900",color:ORANGE,marginTop:14}}>{money(item.price_toman)}</Text>
 <Text style={{textAlign:"right",fontSize:12,color:"#777",marginTop:10}}>{item.city} · {item.category}</Text>
 <View style={{height:1,backgroundColor:"#EEE6DC",marginVertical:16}}/>
 <Text style={{textAlign:"right",fontWeight:"900",fontSize:16,color:INK}}>توضیحات آگهی</Text>
 <Text style={{textAlign:"right",fontSize:14,lineHeight:27,color:"#555",marginTop:9}}>{item.description||"توضیحاتی ثبت نشده است."}</Text>
 {item.contact_phone?<Pressable onPress={()=>Linking.openURL("tel:"+item.contact_phone)} style={{backgroundColor:ORANGE,padding:15,borderRadius:12,marginTop:20}}><Text style={{color:"white",fontWeight:"900",textAlign:"center"}}>تماس با آگهی‌دهنده · {item.contact_phone}</Text></Pressable>:null}
 <Text style={{fontSize:11,color:"#777",textAlign:"right",marginTop:15,lineHeight:20}}>قبل از پرداخت، کالا را بررسی کن و از واریز بیعانه بدون اطمینان خودداری کن.</Text>
 </View></>:null}
 </ScrollView></SafeAreaView>;
}