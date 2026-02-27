import AuthInput from "@/components/AuthInput";
import { COLORS } from "@/constants/colors";
import { ROUTES } from "@/constants/routeConstants";
import Toast from "@/components/Toast";
import { useSignupForm } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Signup() {
  const router = useRouter();
  const {
    email,
    password,
    emailError,
    passwordError,
    loading,
    onChangeEmail,
    onChangePassword,
    submit,
  } = useSignupForm();

  const handleSignup = async () => {
    const ok = await submit();
    if (ok) {
      router.replace(ROUTES.LOGIN);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.headerTextWrapper}>
            <Text style={styles.heyText}>Hey!</Text>
            <Text style={styles.titleText}>Join now</Text>
          </View>

          <View style={styles.form}>
            <AuthInput
              placeholder="Enter email id"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={onChangeEmail}
              error={emailError}
            />

            <AuthInput
              placeholder="Create password"
              secureTextEntry
              value={password}
              onChangeText={onChangePassword}
              error={passwordError}
            />

            <TouchableOpacity
              style={[
                styles.primaryButton,
                loading && styles.primaryButtonDisabled,
              ]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? "Creating..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => router.replace(ROUTES.LOGIN)}
            >
              <Text style={styles.secondaryText}>Or Login here</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footerText}>Terms & Conditions Apply*</Text>
      </View>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
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
    shadowColor: COLORS.black,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  headerTextWrapper: {
    marginBottom: 24,
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
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.tabRow,
    borderRadius: 24,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  form: {
    marginTop: 8,
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 26,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryAction: {
    marginTop: 12,
    alignItems: "center",
  },
  secondaryText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  footerText: {
    marginTop: 16,
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
