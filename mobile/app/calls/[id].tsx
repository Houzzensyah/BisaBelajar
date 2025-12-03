import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { callsApi, auth } from "../services/api";
import { getToken } from "../services/auth";

export default function CallScreen() {
  const { id } = useLocalSearchParams();
  const [call, setCall] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        try {
          const meRes = await auth.me();
          setMe(meRes.data);
        } catch {
          /* noop */
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const load = async () => {
      try {
        const res = await callsApi.show(Number(id));
        if (mounted) setCall(res.data);
      } catch (e) {
        console.warn(e);
      }
    };
    load();
    const interval = setInterval(load, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [id]);

  if (!call)
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );

  const isCallee = me && me.id === call.callee_id;
  const canEnd = me && [call.caller_id, call.callee_id].includes(me.id);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Call</Text>
      <Text style={styles.subtitle}>Status: {call.status}</Text>
      <Text style={styles.subtitle}>From: {call.caller?.name}</Text>
      <Text style={styles.subtitle}>To: {call.callee?.name}</Text>

      {isCallee && call.status === "pending" ? (
        <View style={{ marginTop: 12 }}>
          <Button
            title="Accept"
            onPress={async () => {
              try {
                await callsApi.accept(call.id);
              } catch (e) {
                console.warn(e);
              }
            }}
          />
          <View style={{ height: 8 }} />
          <Button
            title="Decline"
            onPress={async () => {
              try {
                await callsApi.decline(call.id);
                router.replace("/(tabs)/chat");
              } catch (e) {
                console.warn(e);
              }
            }}
          />
        </View>
      ) : null}

      {canEnd && call.status === "accepted" ? (
        <View style={{ marginTop: 12 }}>
          <Button
            title="End Call"
            onPress={async () => {
              try {
                await callsApi.end(call.id);
                router.replace("/");
              } catch (e) {
                console.warn(e);
              }
            }}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f7fafc" },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { marginTop: 6 },
});
