import { useCallback,useEffect,useState } from "react";
import { ActivityIndicator,FlatList,Image,Pressable,SafeAreaView,Text,TextInput,View } from "react-native";
import { useRouter } from "expo-router";
import { getListings,Listing } from "../lib/api";
const O="#F47735",I="#18343C",C="#FFF8EF";
const cats=["همه","املاک","خودرو","موبایل و دیجیتال","خانه و آشپزخانه","استخدام و کاریابی","خدمات","وسایل شخصی","ورزش و سرگرمی"];
const money=(v?:number|string|null)=>!v||Number(v)===0?"توافقی":Number(v).toLocaleString("fa-IR")+" تومان";
export default function HomeScreen(){
 const router=useRouter(),[items,setItems]=useState<Listing[]>([]),[query,setQuery]=useState(""),[city,setCity]=useState(""),[category,setCategory]=useState("همه"),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const load=useCallback(async()=>{try{setError("");setItems(await getListings({q:query,city,category:category==="همه"?"":category}));}catch(e){setError(e instanceof Error?e.message:"اتصال برقرار نشد.");}finally{setLoading(false);}},[query,city,category]);
 useEffect(()=>{void load();},[load]);
 return <SafeAreaView style={{flex:1,backgroundColor:C}}>
 <FlatList data={items} keyExtractor={x=>String(x.id)} numColumns={2} columnWrapperStyle={{gap:10,paddingHorizontal:14}} contentContainerStyle={{paddingBottom:18,gap:10}}
 ListHeaderComponent={<>
 <View style={{backgroundColor:I,padding:19,paddingTop:22,borderBottomLeftRadius:24,borderBottomRightRadius:24}}>
 <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}>
 <Pressable onPress={()=>router.push("/account")} style={{backgroundColor:"#FFFFFF20",padding:10,borderRadius:10}}><Text style={{color:"white",fontWeight:"800"}}>حساب من</Text></Pressable>
 <View><Text style={{color:"white",fontSize:27,fontWeight:"900",textAlign:"right"}}>سه‌سوته</Text><Text style={{color:"#F8D9C7",textAlign:"right",marginTop:4}}>هرچی می‌خوای، سه‌سوته!</Text></View></View>
 <TextInput value={query} onChangeText={setQuery} placeholder="چی می‌خوای پیدا کنی؟" placeholderTextColor="#888" textAlign="right" returnKeyType="search" style={{backgroundColor:"white",borderRadius:12,padding:13,marginTop:16}}/>
 <TextInput value={city} onChangeText={setCity} placeholder="فیلتر شهر، مثلاً تهران" placeholderTextColor="#888" textAlign="right" returnKeyType="search" style={{backgroundColor:"#FFFFFFE8",borderRadius:12,padding:11,marginTop:8}}/>
 </View>
 <Text style={{fontSize:17,fontWeight:"900",color:I,textAlign:"right",paddingHorizontal:18,marginTop:17,marginBottom:10}}>دسته‌بندی‌ها</Text>
 <FlatList horizontal inverted data={cats} keyExtractor={x=>x} showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:14,gap:7}} renderItem={({item})=><Pressable onPress={()=>setCategory(item)} style={{backgroundColor:category===item?O:"white",paddingHorizontal:13,paddingVertical:9,borderRadius:20,borderWidth:1,borderColor:category===item?O:"#EEE3D8"}}><Text style={{color:category===item?"white":I,fontWeight:"800",fontSize:12}}>{item}</Text></Pressable>}/>
 <View style={{padding:17,flexDirection:"row",justifyContent:"space-between"}}><Text style={{color:O,fontWeight:"800"}}>{items.length.toLocaleString("fa-IR")} آگهی</Text><Text style={{fontSize:18,fontWeight:"900",color:I}}>تازه‌ترین آگهی‌ها</Text></View>
 {error?<Pressable onPress={()=>{setLoading(true);void load();}}><Text style={{textAlign:"center",color:"#B42318",padding:12}}>{error} · تلاش دوباره</Text></Pressable>:null}
 {loading?<ActivityIndicator color={O} size="large" style={{margin:25}}/>:null}
 </>}
 renderItem={({item})=><Pressable onPress={()=>router.push("/ads/"+item.id)} style={{flex:1,backgroundColor:"white",borderRadius:14,overflow:"hidden",borderWidth:1,borderColor:"#F0E9DF"}}>
 {item.image_urls?.[0]?<Image source={{uri:item.image_urls[0]}} style={{width:"100%",height:125,backgroundColor:"#F1ECE5"}} resizeMode="cover"/>:<View style={{height:125,backgroundColor:"#F1ECE5",alignItems:"center",justifyContent:"center"}}><Text style={{color:"#999"}}>بدون تصویر</Text></View>}
 <View style={{padding:10}}><Text numberOfLines={2} style={{color:I,textAlign:"right",fontSize:13,fontWeight:"800",minHeight:38}}>{item.title}</Text><Text style={{color:O,textAlign:"right",fontWeight:"900",marginTop:8,fontSize:12}}>{money(item.price_toman)}</Text><Text style={{color:"#818181",textAlign:"right",fontSize:11,marginTop:5}}>{item.city||"ایران"} · {item.category||"آگهی"}</Text>{item.is_featured?<Text style={{color:"#9A6500",textAlign:"right",fontSize:10,marginTop:5}}>★ آگهی ویژه</Text>:null}</View></Pressable>}
 ListEmptyComponent={!loading&&!error?<Text style={{textAlign:"center",color:"#777",marginTop:30}}>آگهی‌ای با این مشخصات پیدا نشد.</Text>:null}/>
 <View style={{flexDirection:"row",backgroundColor:"white",borderTopWidth:1,borderTopColor:"#EEE3D8",paddingVertical:10}}>{[{label:"خانه",icon:"⌂",path:"/"},{label:"ثبت آگهی",icon:"＋",path:"/post-ad"},{label:"حساب من",icon:"◎",path:"/account"}].map(x=><Pressable key={x.path} onPress={()=>router.push(x.path as never)} style={{flex:1,alignItems:"center"}}><Text style={{fontSize:20,color:O,fontWeight:"900"}}>{x.icon}</Text><Text style={{fontSize:11,color:I,fontWeight:"800"}}>{x.label}</Text></Pressable>)}</View>
 </SafeAreaView>;
}