import { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { createListing } from "../lib/api";

const ORANGE="#F47735",INK="#18343C";
const categories=["املاک","خودرو","موبایل و دیجیتال","خانه و آشپزخانه","استخدام و کاریابی","خدمات","وسایل شخصی","ورزش و سرگرمی"];
export default function PostAdScreen(){
 const router=useRouter();const [title,setTitle]=useState("");const [category,setCategory]=useState(categories[0]);
 const [price,setPrice]=useState("");const [city,setCity]=useState("");const [description,setDescription]=useState("");const [phone,setPhone]=useState("");
 const [images,setImages]=useState<ImagePicker.ImagePickerAsset[]>([]);const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const field={backgroundColor:"white",borderWidth:1,borderColor:"#E9E2D9",borderRadius:12,padding:13,fontSize:14,color:INK,marginTop:7} as const;
 async function pick(){const permission=await ImagePicker.requestMediaLibraryPermissionsAsync();if(!permission.granted){Alert.alert("دسترسی عکس‌ها","برای انتخاب عکس اجازه دسترسی بده.");return;}
 const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:["images"],allowsMultipleSelection:true,selectionLimit:4-images.length,quality:.82});
 if(!result.canceled){if(images.length+result.assets.length>4){setError("حداکثر ۴ عکس مجاز است.");return;}setImages(v=>[...v,...result.assets]);setError("");}}
 async function submit(){setBusy(true);setError("");try{const r=await createListing({title,category,price_toman:price,city,description,contact_phone:phone,images:images.map(x=>({uri:x.uri,fileName:x.fileName,mimeType:x.mimeType}))});Alert.alert("آگهی ثبت شد",r.message,[{text:"مشاهده حساب",onPress:()=>router.replace("/account") }]);setTitle("");setPrice("");setCity("");setDescription("");setPhone("");setImages([]);}catch(e){setError(e instanceof Error?e.message:"ثبت آگهی انجام نشد.");}finally{setBusy(false);}}
 return <SafeAreaView style={{flex:1,backgroundColor:"#FFF8EF"}}><ScrollView contentContainerStyle={{padding:18,paddingBottom:40}}>
 <Pressable onPress={()=>router.back()}><Text style={{color:ORANGE,textAlign:"right",fontWeight:"700"}}>← بازگشت</Text></Pressable>
 <Text style={{fontSize:24,fontWeight:"900",color:INK,textAlign:"right",marginTop:18}}>ثبت آگهی جدید</Text>
 <Text style={{fontSize:12,color:"#777",textAlign:"right",marginTop:6}}>آگهی پس از بررسی مدیر در سایت و اپ منتشر می‌شود.</Text>
 <View style={{backgroundColor:"white",borderRadius:18,padding:15,marginTop:18}}>
 <Text style={{textAlign:"right",fontWeight:"800",color:INK}}>عنوان آگهی</Text><TextInput value={title} onChangeText={setTitle} maxLength={100} placeholder="مثلاً فروش گوشی سامسونگ" placeholderTextColor="#999" textAlign="right" style={field}/>
 <Text style={{textAlign:"right",fontWeight:"800",color:INK,marginTop:15}}>دسته‌بندی</Text>
 <View style={{flexDirection:"row",flexWrap:"wrap",gap:7,marginTop:8}}>{categories.map(c=><Pressable key={c} onPress={()=>setCategory(c)} style={{backgroundColor:category===c?ORANGE:"#F5F0E9",paddingHorizontal:11,paddingVertical:9,borderRadius:10}}><Text style={{fontSize:12,color:category===c?"white":INK,fontWeight:"700"}}>{c}</Text></Pressable>)}</View>
 <Text style={{textAlign:"right",fontWeight:"800",color:INK,marginTop:15}}>قیمت به تومان</Text><TextInput value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="برای قیمت توافقی خالی بگذار" placeholderTextColor="#999" textAlign="right" style={field}/>
 <Text style={{textAlign:"right",fontWeight:"800",color:INK,marginTop:15}}>شهر</Text><TextInput value={city} onChangeText={setCity} placeholder="مثلاً تهران" placeholderTextColor="#999" textAlign="right" style={field}/>
 <Text style={{textAlign:"right",fontWeight:"800",color:INK,marginTop:15}}>شماره تماس</Text><TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="09123456789" placeholderTextColor="#999" textAlign="left" style={field}/>
 <Text style={{textAlign:"right",fontWeight:"800",color:INK,marginTop:15}}>توضیحات</Text><TextInput value={description} onChangeText={setDescription} multiline numberOfLines={5} textAlignVertical="top" placeholder="جزئیات آگهی را بنویس..." placeholderTextColor="#999" style={[field,{minHeight:115}]}/>
 <Text style={{textAlign:"right",fontWeight:"800",color:INK,marginTop:17}}>عکس‌ها (حداکثر ۴ عکس)</Text>
 <Pressable onPress={pick} style={{borderWidth:1,borderStyle:"dashed",borderColor:ORANGE,borderRadius:12,padding:16,marginTop:8}}><Text style={{textAlign:"center",color:ORANGE,fontWeight:"800"}}>＋ انتخاب عکس از گوشی</Text></Pressable>
 {images.length>0&&<View style={{flexDirection:"row",flexWrap:"wrap",gap:8,marginTop:10}}>{images.map((x,i)=><View key={x.uri} style={{width:"30%",aspectRatio:1}}><Image source={{uri:x.uri}} style={{width:"100%",height:"100%",borderRadius:10}}/><Pressable onPress={()=>setImages(v=>v.filter((_,j)=>i!==j))} style={{position:"absolute",top:4,right:4,backgroundColor:"#0009",padding:5,borderRadius:10}}><Text style={{color:"white",fontSize:10}}>حذف</Text></Pressable></View>)}</View>}
 {error?<Text style={{color:"#B42318",textAlign:"right",marginTop:12,fontSize:12}}>{error}</Text>:null}
 <Pressable disabled={busy} onPress={submit} style={{backgroundColor:ORANGE,padding:15,borderRadius:12,marginTop:20,alignItems:"center",opacity:busy?.65:1}}>{busy?<ActivityIndicator color="white"/>:<Text style={{color:"white",fontWeight:"900"}}>ثبت آگهی برای بررسی</Text>}</Pressable>
 </View></ScrollView></SafeAreaView>;
}