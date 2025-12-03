import { StyleSheet, View, FlatList, TouchableOpacity, TextInput } from "react-native";

// Removed unused Collapsible and ExternalLink imports
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
// Removed IconSymbol and Fonts usage to keep UI minimal
import { useState, useRef, useEffect } from "react";
import { search, specialtiesApi } from "../services/api";
import getLocationModule from "../services/optional-location";
// Try to import expo-location dynamically to avoid compile error if package not installed
import { useRouter } from "expo-router";

export default function TabTwoScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>({ users: { data: [] }, skills: { data: [] } });
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<number | null>(null);
  const [distance, setDistance] = useState<number>(50);
  const [location, setLocation] = useState<{ latitude?: number; longitude?: number } | null>(null);
  const router = useRouter();

  const searchTimeout = useRef<number | null>(null);

  const doSearch = async (q: string) => {
    setQuery(q);
    // If query less than 2 chars, but filters exist, allow search with empty query
    const shouldSearch = q.length >= 2 || selectedSpec !== null || !!location?.latitude || !!location?.longitude;
    if (!shouldSearch) {
      setResults({ users: { data: [] }, skills: { data: [] } });
      return;
    }
    // debounce: wait 400ms after typing stops
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    searchTimeout.current = window.setTimeout(async () => {
      try {
        const params: any = { query: q };
        if (selectedSpec) params.specialty = selectedSpec;
        if (location?.latitude && location?.longitude) {
          params.lat = location.latitude;
          params.lng = location.longitude;
          params.distance = distance;
        }
        const result = await search.query(q, params);
        const resultData = result?.data;
        setResults({ users: resultData.users, skills: resultData.skills });
      } catch (err) {
        console.warn(err);
      }
    }, 400);
  };

  // performSearch runs search immediately without debounce (used when filters update)
  const performSearch = async (q: string) => {
    if (!q || q.length < 2) return;
    try {
      const params: any = { query: q };
      if (selectedSpec) params.specialty = selectedSpec;
      if (location?.latitude && location?.longitude) {
        params.lat = location.latitude;
        params.lng = location.longitude;
        params.distance = distance;
      }
      const result = await search.query(q, params);
      const resultData = result?.data;
      setResults({ users: resultData.users, skills: resultData.skills });
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await specialtiesApi.list();
        setSpecialties(res.data || res.data.data || []);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, []);

  useEffect(() => {
    // re-run search when filters change and there is an existing query
    if (query && query.length >= 2) {
      performSearch(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSpec, location, distance]);

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }} headerImage={<View />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>
      <View style={{ padding: 12 }}>
        <TextInput placeholder="Search users or skills" value={query} onChangeText={doSearch} style={{ borderWidth: 1, borderColor: "#eee", padding: 8, borderRadius: 6, marginBottom: 8 }} />
        <View style={{ flexDirection: "row", marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <TextInput placeholder="Distance km" value={String(distance)} keyboardType="numeric" onChangeText={(t) => setDistance(Number(t) || 0)} style={{ borderWidth: 1, borderColor: "#eee", padding: 8, borderRadius: 6 }} />
          </View>
          <TouchableOpacity
            onPress={async () => {
              try {
                // dynamic import in case expo-location is not installed
                const Location = await getLocationModule();
                if (!Location) {
                  console.warn("expo-location not available");
                  return;
                }
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") return;
                const loc = await Location.getCurrentPositionAsync({});
                setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
              } catch (e) {
                console.warn(e);
              }
            }}
            style={{ padding: 8 }}
          >
            <ThemedText>{location?.latitude ? "Using my location" : "Use my location"}</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", marginBottom: 8 }}>
          <ThemedText type="subtitle">Filters</ThemedText>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 10 }}>
          {specialties?.map((s: any) => (
            <TouchableOpacity key={s.id} onPress={() => setSelectedSpec(selectedSpec === s.id ? null : s.id)} style={[styles.chip, { backgroundColor: selectedSpec === s.id ? "#0ea5a3" : "#fff" }]}>
              <ThemedText style={{ color: selectedSpec === s.id ? "#fff" : "#000" }}>{s.name}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        {results?.users?.data?.length ? (
          <View>
            <ThemedText type="subtitle">Users</ThemedText>
            <FlatList
              data={results.users.data}
              keyExtractor={(u) => String(u.id)}
              horizontal
              renderItem={({ item }) => (
                <TouchableOpacity style={{ padding: 12, backgroundColor: "#fff", borderRadius: 8, marginRight: 8 }} onPress={() => router.push(`/users/${item.id}`)}>
                  <ThemedText>{item.name}</ThemedText>
                  <ThemedText type="default">{item.skills?.map((s: any) => s.name).join(", ")}</ThemedText>
                  {item.distance ? <ThemedText type="default">{Number(item.distance).toFixed(1)} km</ThemedText> : null}
                </TouchableOpacity>
              )}
            />
          </View>
        ) : null}
        {results?.users?.data?.length === 0 && query.length >= 2 ? <ThemedText type="default">No users found</ThemedText> : null}
        {results?.skills?.data?.length ? (
          <View style={{ marginTop: 12 }}>
            <ThemedText type="subtitle">Skills</ThemedText>
            <FlatList
              data={results.skills.data}
              keyExtractor={(s) => String(s.id)}
              horizontal
              renderItem={({ item }) => (
                <TouchableOpacity style={{ padding: 12, backgroundColor: "#fff", borderRadius: 8, marginRight: 8 }} onPress={() => router.push(`/skills/${item.id}`)}>
                  <ThemedText>{item.name}</ThemedText>
                  <ThemedText type="default">By {item.user?.name}</ThemedText>
                </TouchableOpacity>
              )}
            />
          </View>
        ) : null}
        {results?.skills?.data?.length === 0 && query.length >= 2 ? <ThemedText type="default">No skills found</ThemedText> : null}
      </View>
    </ParallaxScrollView>
  );
}

// specialties are already fetched in component effect

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    marginBottom: 6,
  },
  chip: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#fff", borderRadius: 16, marginRight: 8, marginBottom: 8 },
});
