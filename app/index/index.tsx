import { COLORS } from "@/constants/colors";
import { ROUTES } from "@/constants/routeConstants";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.replace(ROUTES.HOME);
      } else {
        router.replace(ROUTES.LOGIN);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.titleText}>Task Reminder Lite</Text>
        <Text style={styles.subtitleText}>Getting things ready for you...</Text>

        <ActivityIndicator
          size="small"
          color={COLORS.primary}
          style={styles.spinner}
        />
      </View>

      <Text style={styles.footerText}>Powered by Task Reminder Lite</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  heyText: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  spinner: {
    marginTop: 20,
  },
  footerText: {
    marginTop: 20,
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
