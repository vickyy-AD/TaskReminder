import AuthInput from "@/components/AuthInput";
import { COLORS } from "@/constants/colors";
import { ROUTES } from "@/constants/routeConstants";
import Toast from "@/components/Toast";
import { useLoginForm } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
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
  } = useLoginForm();

  const handleLogin = async () => {
    const ok = await submit();
    if (ok) {
      router.replace(ROUTES.HOME);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.headerTextWrapper}>
            <Text style={styles.heyText}>Hey!</Text>
            <Text style={styles.titleText}>Welcome Back</Text>
          </View>

          <View style={styles.form}>
            <AuthInput
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={onChangeEmail}
              error={emailError}
            />

            <AuthInput
              placeholder="Password"
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
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => router.replace(ROUTES.SIGNUP)}
            >
              <Text style={styles.secondaryText}>Or sign up here</Text>
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
    marginBottom: 32,
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
