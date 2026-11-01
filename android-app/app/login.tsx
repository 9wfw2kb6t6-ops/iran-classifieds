import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { login, register } from "../lib/api";

const ORANGE="#F47735", INK="#18343C";
export default function LoginScreen() {
  const router=useRouter();
  const [mode,setMode]=useState<"login"|"register">("login");
  const [phone,setPhone]=useState("");
  const [password,setPassword]=useState("");
  const [name,setName]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit() {
    setBusy(true);
    try {
      if(mode==="login") await login(phone,password);
      else await register(phone,password,name);
      router.replace("/account");
    } catch(e) { Alert.alert("سه‌سوته",e instanceof Error?e.message:"عملیات انجام نشد."); }
    finally { setBusy(false); }
  }
  const input={backgroundColor:"#FFFFFF",borderWidth:1,borderColor:"#E9E2D9",borderRadius:13,paddingHorizontal:14,paddingVertical:14,fontSize:15,color:INK,marginTop:7} as const;
  return <SafeAreaView style={{flex:1,backgroundColor:"#FFF8EF",padding:20,justifyContent:"center"}}>
    <Pressable onPress={()=>router.back()}><Text style={{color:ORANGE,textAlign:"right",fontWeight:"700"}}>← بازگشت</Text></Pressable>
    <View style={{backgroundColor:INK,borderRadius:22,padding:22,marginTop:24}}>
      <Text style={{color:"#FFFFFF",fontSize:28,fontWeight:"900",textAlign:"right"}}>سه‌سوته</Text>
      <Text style={{color:"#F8D9C7",textAlign:"right",marginTop:6}}>همان حساب کاربری سایت، در اپلیکیشن</Text>
    </View>
    <View style={{flexDirection:"row",gap:8,marginTop:22}}>
      <Pressable onPress={()=>setMode("login")} style={{flex:1,backgroundColor:mode==="login"?ORANGE:"#F2E8DD",padding:13,borderRadius:12}}><Text style={{textAlign:"center",fontWeight:"800",color:mode==="login"?"white":INK}}>ورود</Text></Pressable>
      <Pressable onPress={()=>setMode("register")} style={{flex:1,backgroundColor:mode==="register"?ORANGE:"#F2E8DD",padding:13,borderRadius:12}}><Text style={{textAlign:"center",fontWeight:"800",color:mode==="register"?"white":INK}}>ثبت‌نام</Text></Pressable>
    </View>
    {mode==="register"&&<View style={{marginTop:18}}><Text style={{textAlign:"right",fontWeight:"700",color:INK}}>نام نمایشی</Text><TextInput value={name} onChangeText={setName} placeholder="نام شما" placeholderTextColor="#999" style={input}/></View>}
    <View style={{marginTop:18}}><Text style={{textAlign:"right",fontWeight:"700",color:INK}}>شماره موبایل ایران</Text><TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="09123456789" placeholderTextColor="#999" textAlign="left" style={input}/></View>
    <View style={{marginTop:16}}><Text style={{textAlign:"right",fontWeight:"700",color:INK}}>رمز عبور</Text><TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder={mode==="register"?"حداقل ۸ کاراکتر":"رمز عبور"} placeholderTextColor="#999" style={input}/></View>
    <Pressable disabled={busy} onPress={submit} style={{backgroundColor:ORANGE,padding:16,borderRadius:13,marginTop:24,opacity:busy?.65:1,alignItems:"center"}}>
      {busy?<ActivityIndicator color="white"/>:<Text style={{color:"white",fontWeight:"900",fontSize:15}}>{mode==="login"?"ورود به حساب":"ساخت حساب سه‌سوته"}</Text>}
    </Pressable>
    <Text style={{textAlign:"center",color:"#777",fontSize:11,lineHeight:20,marginTop:16}}>حساب و آگهی‌ها بین سایت و اپ مشترک هستند. پیامک تأیید شماره در حال حاضر فعال نیست.</Text>
  </SafeAreaView>;
}