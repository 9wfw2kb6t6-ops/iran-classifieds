import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, SafeAreaView, Text, TextInput, View } from "react-native";
import { getListings, Listing } from "../lib/api";

const ORANGE = "#F47735";
const INK = "#18343C";
const CREAM = "#FFF8EF";
const money = (value?: number | string | null) => {
  if (value === null || value === undefined || value === "" || Number(value) === 0) return "توافقی";
  return Number(value).toLocaleString("fa-IR") + " تومان";
};

export default function HomeScreen() {
  const [items, setItems] = useState<Listing[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { setError(""); setItems(await getListings()); }
    catch { setError("اتصال به سه‌سوته برقرار نشد. دوباره تلاش کن."); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const filtered = items.filter(x => (x.title || "").toLowerCase().includes(query.trim().toLowerCase()));
  return <SafeAreaView style={{ flex: 1, backgroundColor: CREAM }}>
    <View style={{ backgroundColor: INK, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
      <Text style={{ color: "#FFFFFF", fontSize: 27, fontWeight: "900", textAlign: "right" }}>سه‌سوته</Text>
      <Text style={{ color: "#F8D9C7", fontSize: 13, textAlign: "right", marginTop: 5 }}>هرچی می‌خوای، سه‌سوته!</Text>
      <TextInput value={query} onChangeText={setQuery} placeholder="چی می‌خوای پیدا کنی؟" placeholderTextColor="#7A8588" textAlign="right" style={{ backgroundColor: "#FFFFFF", borderRadius: 13, paddingHorizontal: 15, paddingVertical: 13, marginTop: 18, fontSize: 14 }} />
    </View>
    <View style={{ paddingHorizontal: 18, paddingTop: 20, paddingBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text style={{ color: INK, fontSize: 19, fontWeight: "800" }}>تازه‌ترین آگهی‌ها</Text>
      <Text style={{ color: ORANGE, fontSize: 12, fontWeight: "700" }}>{items.length.toLocaleString("fa-IR")} آگهی</Text>
    </View>
    {loading ? <ActivityIndicator color={ORANGE} style={{ marginTop: 50 }} size="large" /> :
      error ? <Pressable onPress={() => { setLoading(true); void load(); }} style={{ padding: 24 }}><Text style={{ textAlign: "center", color: INK }}>{error}  ·  تلاش دوباره</Text></Pressable> :
      <FlatList data={filtered} keyExtractor={(item) => String(item.id)} numColumns={2} columnWrapperStyle={{ gap: 10, paddingHorizontal: 14 }} contentContainerStyle={{ paddingBottom: 28, gap: 10 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={ORANGE} />} renderItem={({ item }) =>
        <View style={{ flex: 1, backgroundColor: "#FFFFFF", borderRadius: 15, overflow: "hidden", borderWidth: 1, borderColor: "#F0E9DF" }}>
          {item.image_urls?.[0] ? <Image source={{ uri: item.image_urls[0] }} style={{ width: "100%", height: 125, backgroundColor: "#F1ECE5" }} resizeMode="cover" /> : <View style={{ height: 125, backgroundColor: "#F1ECE5", alignItems: "center", justifyContent: "center" }}><Text style={{ color: "#9A9A9A", fontSize: 12 }}>بدون تصویر</Text></View>}
          <View style={{ padding: 10 }}>
            <Text numberOfLines={2} style={{ color: INK, textAlign: "right", fontSize: 13, fontWeight: "700", minHeight: 38 }}>{item.title}</Text>
            <Text style={{ color: ORANGE, textAlign: "right", fontSize: 12, fontWeight: "800", marginTop: 8 }}>{money(item.price_toman)}</Text>
            <Text style={{ color: "#818181", textAlign: "right", fontSize: 11, marginTop: 5 }}>{item.city || "ایران"} · {item.category || "آگهی"}</Text>
          </View>
        </View>
      } ListEmptyComponent={<Text style={{ textAlign: "center", color: "#777", marginTop: 35 }}>فعلاً آگهی‌ای برای نمایش وجود ندارد.</Text>} />
    }
  </SafeAreaView>;
}
