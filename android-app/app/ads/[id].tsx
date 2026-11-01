import { useEffect,useState } from "react";
import { ActivityIndicator,Alert,Image,Linking,Pressable,SafeAreaView,ScrollView,Text,TextInput,View } from "react-native";
import { useLocalSearchParams,useRouter } from "expo-router";
import { getListing,Listing } from "../../lib/api";
import { reportListing } from "../../lib/report-api";
const O="#F47735",I="#18343C";
const money=(n?:number|string|null)=>!n||Number(n)===0?"توافقی":Number(n).toLocaleString("fa-IR")+" تومان";
const reasons=[{id:"fraud",label:"احتمال کلاهبرداری"},{id:"wrong_info",label:"اطلاعات نادرست"},{id:"prohibited",label:"محتوای ممنوع"},{id:"duplicate",label:"آگهی تکراری"},{id:"other",label:"سایر موارد"}];
export default function ListingDetail(){
 const {id}=useLocalSearchParams<{id:string}>();const router=useRouter();
 const [item,setItem]=useState<Listing|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 const [reportOpen,setReportOpen]=useState(false);const [reason,setReason]=useState("fraud");const [details,setDetails]=useState("");const [contact,setContact]=useState("");const [reportBusy,setReportBusy]=useState(false);
 useEffect(()=>{let active=true;getListing(String(id)).then(x=>{if(active)setItem(x);}).catch(e=>{if(active)setError(e instanceof Error?e.message:"آگهی پیدا نشد.");}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[id]);
 async function sendReport(){if(!item)return;setReportBusy(true);try{const r=await reportListing({listing_id:Number(item.id),reason,details,reporter_contact:contact});Alert.alert("گزارش ثبت شد",r.message);setReportOpen(false);setDetails("");setContact("");}catch(e){Alert.alert("ثبت گزارش",e instanceof Error?e.message:"ثبت گزارش انجام نشد.");}finally{setReportBusy(false);}}
 const whatsapp=item?.contact_phone?"98"+item.contact_phone.slice(1):"";
 return <SafeAreaView style={{flex:1,backgroundColor:"#FFF8EF"}}><ScrollView contentContainerStyle={{padding:16,paddingBottom:35}}>
 <Pressable onPress={()=>router.back()}><Text style={{color:O,textAlign:"right",fontWeight:"800"}}>← بازگشت</Text></Pressable>
 {loading?<ActivityIndicator color={O} size="large" style={{marginTop:70}}/>:error?<Text style={{textAlign:"center",color:"#B42318",marginTop:40}}>{error}</Text>:item?<>{item.image_urls?.length?<ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{marginTop:16}}>{item.image_urls.map((uri,i)=><Image key={uri+i} source={{uri}} style={{width:320,height:250,borderRadius:16,marginRight:8,backgroundColor:"#eee"}} resizeMode="cover"/>)}</ScrollView>:<View style={{height:190,backgroundColor:"#F0EAE1",borderRadius:16,alignItems:"center",justifyContent:"center",marginTop:16}}><Text style={{color:"#999"}}>بدون تصویر</Text></View>}
 <View style={{backgroundColor:"white",padding:18,borderRadius:17,marginTop:15}}>
 <Text style={{textAlign:"right",fontSize:21,fontWeight:"900",color:I,lineHeight:32}}>{item.title}</Text>
 <Text style={{textAlign:"right",fontSize:20,fontWeight:"900",color:O,marginTop:14}}>{money(item.price_toman)}</Text>
 <Text style={{textAlign:"right",fontSize:12,color:"#777",marginTop:10}}>{item.city} · {item.category}</Text>
 <View style={{height:1,backgroundColor:"#EEE6DC",marginVertical:16}}/>
 <Text style={{textAlign:"right",fontWeight:"900",fontSize:16,color:I}}>توضیحات آگهی</Text>
 <Text style={{textAlign:"right",fontSize:14,lineHeight:27,color:"#555",marginTop:9}}>{item.description||"توضیحاتی ثبت نشده است."}</Text>
 {item.contact_phone?<><Pressable onPress={()=>Linking.openURL("tel:"+item.contact_phone)} style={{backgroundColor:O,padding:15,borderRadius:12,marginTop:20}}><Text style={{color:"white",fontWeight:"900",textAlign:"center"}}>تماس با آگهی‌دهنده · {item.contact_phone}</Text></Pressable><Pressable onPress={()=>Linking.openURL("https://wa.me/"+whatsapp)} style={{backgroundColor:"#E8F7EE",padding:14,borderRadius:12,marginTop:9}}><Text style={{color:"#16834A",fontWeight:"900",textAlign:"center"}}>ارسال پیام در واتساپ</Text></Pressable></>:null}
 <Text style={{fontSize:11,color:"#777",textAlign:"right",marginTop:15,lineHeight:20}}>قبل از پرداخت، کالا را بررسی کن و از واریز بیعانه بدون اطمینان خودداری کن.</Text>
 <Pressable onPress={()=>setReportOpen(v=>!v)} style={{borderWidth:1,borderColor:"#F0C9C5",backgroundColor:"#FFF5F4",padding:12,borderRadius:10,marginTop:17}}><Text style={{color:"#B42318",textAlign:"center",fontWeight:"800"}}>گزارش آگهی مشکوک یا خلاف قوانین</Text></Pressable>
 {reportOpen?<View style={{marginTop:12,backgroundColor:"#FFF8EF",padding:12,borderRadius:12}}>
 <Text style={{textAlign:"right",fontWeight:"800",color:I}}>دلیل گزارش</Text>
 {reasons.map(x=><Pressable key={x.id} onPress={()=>setReason(x.id)} style={{flexDirection:"row",justifyContent:"flex-end",alignItems:"center",gap:8,paddingVertical:8}}><Text style={{color:I,fontSize:12}}>{x.label}</Text><View style={{width:17,height:17,borderRadius:9,borderWidth:1,borderColor:reason===x.id?O:"#AAA",backgroundColor:reason===x.id?O:"white"}}/></Pressable>)}
 <TextInput value={details} onChangeText={setDetails} multiline maxLength={1500} placeholder="توضیحات (اختیاری)" placeholderTextColor="#999" textAlign="right" style={{backgroundColor:"white",borderWidth:1,borderColor:"#E9E2D9",borderRadius:10,padding:11,minHeight:75,marginTop:6}}/>
 <TextInput value={contact} onChangeText={setContact} maxLength={100} placeholder="راه تماس برای پیگیری (اختیاری)" placeholderTextColor="#999" textAlign="right" style={{backgroundColor:"white",borderWidth:1,borderColor:"#E9E2D9",borderRadius:10,padding:11,marginTop:8}}/>
 <Pressable disabled={reportBusy} onPress={sendReport} style={{backgroundColor:O,padding:12,borderRadius:10,marginTop:10,opacity:reportBusy?0.6:1}}><Text style={{color:"white",fontWeight:"900",textAlign:"center"}}>{reportBusy?"در حال ارسال...":"ارسال گزارش"}</Text></Pressable>
 </View>:null}
 </View></>:null}
 </ScrollView></SafeAreaView>;
}