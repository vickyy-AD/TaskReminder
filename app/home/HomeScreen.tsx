import TaskInputGoldenLuxury from "@/components/TaskInput";
import TaskItem from "@/components/TaskItem";
import Toast from "@/components/Toast";
import { ROUTES } from "@/constants/routeConstants";
import { Task, useTasks } from "@/hooks/useTasks";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useRef } from "react";
import {
  Alert,
  Animated,
  ColorValue,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

// 👑 GOLDEN LUXURY THEME - EXCLUSIVE PREMIUM EDITION 👑
type ThemeType = {
  background: string;
  surface: string;
  surfaceLight: string;
  surfaceBright: string;
  accentGradient: [string, string];
  accentGradient2: [string, string];
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  successGlow: string;
  warningGlow: string;
  errorGlow: string;
  infoGlow: string;
  gold: string;
  goldLight: string;
  goldDark: string;
};

const THEME_GOLDEN_LUXURY: ThemeType = {
  background: "#08070A",
  surface: "#0D0C0F",
  surfaceLight: "#161520",
  surfaceBright: "#242230",
  accentGradient: ["#FFD700", "#FFC700"],
  accentGradient2: ["#DAA520", "#B8860B"],
  textPrimary: "#FFFEF0",
  textSecondary: "#D4AF7A",
  textTertiary: "#9B8B70",
  success: "#76D749",
  warning: "#FFB81C",
  error: "#FF5252",
  info: "#FFD700",
  successGlow: "rgba(118, 215, 73, 0.35)",
  warningGlow: "rgba(255, 184, 28, 0.35)",
  errorGlow: "rgba(255, 82, 82, 0.35)",
  infoGlow: "rgba(255, 215, 0, 0.4)",
  gold: "#FFD700",
  goldLight: "#FFED4E",
  goldDark: "#B8860B",
};

const THEME = THEME_GOLDEN_LUXURY;

function GoldenStatCard({
  icon,
  value,
  label,
  gradientColors,
  textColor,
  theme,
  delay,
}: {
  icon: string;
  value: number;
  label: string;
  gradientColors: ColorValue[];
  textColor: string;
  theme: ThemeType;
  delay: number;
}) {
  const scaleAnim = useRef(new Animated.Value(0.75)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 7,
          tension: 50,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: false,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: false,
            }),
          ]),
        ),
      ]),
    ]).start();
  }, [scaleAnim, opacityAnim, glowAnim, delay]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={statStyles.card}
      >
        <Animated.View
          style={[
            statStyles.goldenBorder,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 1],
              }),
            },
          ]}
        />

        <BlurView intensity={60} tint="dark" style={statStyles.blur}>
          <View style={statStyles.shimmerLine} />
          <Text style={statStyles.icon}>{icon}</Text>
          <Text style={[statStyles.value, { color: textColor }]}>{value}</Text>
          <Text style={[statStyles.label, { color: theme.textTertiary }]}>
            {label}
          </Text>
          <View style={statStyles.goldenBottom} />
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );
}

export default function Home() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const {
    tasks,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    logout,
    fetchTasks,
  } = useTasks();

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleAddTask = useCallback(
    async (title: string, description?: string, dueDate?: Date | null) => {
      const ok = await addTask(title, description, dueDate);
      if (ok) {
        Toast.show({ msg: "Task added ✓", bgColor: THEME.success });
      }
    },
    [addTask],
  );

  const handleLogout = useCallback(() => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace(ROUTES.LOGIN);
        },
      },
    ]);
  }, [logout, router]);

  const renderTaskItem = useCallback(
    ({ item }: { item: Task }) => (
      <TaskItem
        title={item.title}
        description={item.description}
        dueDate={item.due_date}
        completed={item.completed}
        onToggle={() => toggleTask(item.id, item.completed)}
        onDelete={() => deleteTask(item.id)}
        theme={THEME}
      />
    ),
    [toggleTask, deleteTask],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <LinearGradient
          colors={[THEME.gold, THEME.goldDark]}
          style={styles.emptyIcon}
        >
          <Text style={styles.emptyEmoji}>✨</Text>
        </LinearGradient>
        <Text style={[styles.emptyTitle, { color: THEME.textPrimary }]}>
          All tasks completed!
        </Text>
        <Text style={[styles.emptySubtitle, { color: THEME.textSecondary }]}>
          You're absolutely magnificent! 👑
        </Text>
      </View>
    ),
    [],
  );

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.completed).length;
  const overdueTasks = tasks.filter(
    (t) => !t.completed && t.due_date && new Date(t.due_date) < new Date(),
  ).length;
  const todayTasks = tasks.filter(
    (t) =>
      !t.completed &&
      t.due_date &&
      new Date(t.due_date).toDateString() === new Date().toDateString(),
  ).length;

  const progress = totalTasks > 0 ? doneTasks / totalTasks : 0;

  const meshGradient: [ColorValue, ColorValue, ColorValue] = [
    (THEME.gold + "25") as ColorValue,
    (THEME.goldDark + "10") as ColorValue,
    THEME.background as ColorValue,
  ];

  const goldGradient: [ColorValue, ColorValue] = [
    THEME.gold as ColorValue,
    THEME.goldDark as ColorValue,
  ];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: THEME.background }]}
      edges={["top", "left", "right"]}
    >
      <LinearGradient
        colors={meshGradient}
        locations={[0, 0.4, 1]}
        style={styles.meshBg}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.2, y: 1 }}
        pointerEvents="none"
      />

      <Animated.View
        style={[styles.glowElement, styles.glowTopRight, { opacity: fadeAnim }]}
      />
      <Animated.View
        style={[
          styles.glowElement,
          styles.glowBottomLeft,
          { opacity: fadeAnim },
        ]}
      />

      <Animated.FlatList
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        data={tasks}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchTasks}
        contentContainerStyle={[
          styles.listContent,
          tasks.length === 0 && styles.emptyList,
        ]}
        ListHeaderComponent={
          <Animated.View
            style={[
              styles.headerContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={[THEME.surfaceLight + "60", THEME.background]}
              style={styles.headerBg}
            />
            <View style={styles.headerShimmer} />

            <View style={styles.header}>
              <View>
                <Text style={[styles.greeting, { color: THEME.textPrimary }]}>
                  ⏰ Today
                </Text>
                <Text style={[styles.title, { color: THEME.textPrimary }]}>
                  My Tasks
                </Text>
              </View>

              <Pressable
                onPress={handleLogout}
                style={({ pressed }) => [
                  styles.avatarBtn,
                  pressed && { transform: [{ scale: 0.88 }] },
                ]}
              >
                <LinearGradient colors={goldGradient} style={styles.avatar}>
                  <View style={styles.avatarShimmer} />
                  <Text style={styles.avatarText}>A</Text>
                </LinearGradient>
              </Pressable>
            </View>

            <View style={styles.statsContainer}>
              <GoldenStatCard
                icon="📋"
                value={totalTasks}
                label="Total"
                gradientColors={[THEME.surfaceLight, THEME.surfaceBright]}
                textColor={THEME.textPrimary}
                theme={THEME}
                delay={0}
              />
              <GoldenStatCard
                icon="✓"
                value={doneTasks}
                label="Done"
                gradientColors={[THEME.surfaceLight, THEME.surfaceBright]}
                textColor={THEME.success}
                theme={THEME}
                delay={120}
              />
              <GoldenStatCard
                icon="🔔"
                value={todayTasks}
                label="Today"
                gradientColors={[THEME.surfaceLight, THEME.surfaceBright]}
                textColor={THEME.warning}
                theme={THEME}
                delay={240}
              />
              {overdueTasks > 0 && (
                <GoldenStatCard
                  icon="⚠️"
                  value={overdueTasks}
                  label="Overdue"
                  gradientColors={[THEME.surfaceLight, THEME.surfaceBright]}
                  textColor={THEME.error}
                  theme={THEME}
                  delay={360}
                />
              )}
            </View>

            {totalTasks > 0 && (
              <Animated.View
                style={[
                  styles.progressContainer,
                  { backgroundColor: THEME.surfaceLight + "50" },
                ]}
              >
                <View style={styles.progressHeader}>
                  <Text
                    style={[
                      styles.progressLabel,
                      { color: THEME.textSecondary },
                    ]}
                  >
                    Progress
                  </Text>
                  <Text style={[styles.progressPercent, { color: THEME.gold }]}>
                    {Math.round(progress * 100)}%
                  </Text>
                </View>

                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: THEME.surfaceBright },
                  ]}
                >
                  <LinearGradient
                    colors={goldGradient}
                    style={[
                      styles.progressFill,
                      { width: `${progress * 100}%` as any },
                    ]}
                  />
                </View>

                <Text
                  style={[styles.progressText, { color: THEME.textTertiary }]}
                >
                  {doneTasks} of {totalTasks} completed
                </Text>
              </Animated.View>
            )}

            <TaskInputGoldenLuxury onAdd={handleAddTask} theme={THEME} />

            {tasks.length > 0 && (
              <View style={styles.dividerContainer}>
                <LinearGradient
                  colors={[
                    THEME.surfaceBright + "00",
                    THEME.surfaceBright,
                    THEME.surfaceBright + "00",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.divider}
                />
                <Text
                  style={[styles.dividerText, { color: THEME.textTertiary }]}
                >
                  Your Tasks
                </Text>
                <LinearGradient
                  colors={[
                    THEME.surfaceBright + "00",
                    THEME.surfaceBright,
                    THEME.surfaceBright + "00",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.divider}
                />
              </View>
            )}
          </Animated.View>
        }
        ListEmptyComponent={renderEmpty}
        renderItem={renderTaskItem}
        showsVerticalScrollIndicator={false}
      />

      {/* <View style={[styles.footer, { backgroundColor: THEME.surface + "60" }]}>
        <LinearGradient
          colors={[
            (THEME.surfaceLight + "30") as ColorValue,
            (THEME.background + "00") as ColorValue,
          ]}
          style={styles.footerGradient}
        />
        <Text style={[styles.footerText, { color: THEME.textTertiary }]}>
          ✨ Task Reminder Lite • Golden Premium Edition ✨
        </Text>
      </View> */}

      <Toast />
    </SafeAreaView>
  );
}

const inputStyles = StyleSheet.create({
  wrapper: { marginBottom: 32, marginHorizontal: 2 },
  glowBackdrop: {
    position: "absolute",
    top: -60,
    left: -30,
    right: -30,
    height: 400,
    borderRadius: 28,
    backgroundColor: "#FFD700",
    zIndex: -1,
  },
  card: {
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#FFD700",
    shadowOpacity: 0.6,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 14,
  },
  blur: {
    paddingHorizontal: 22,
    paddingVertical: 20,
    borderRadius: 28,
  },
  goldenBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  topLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,215,0,0.3)",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  leadIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,215,0,0.08)",
  },
  leadIconActive: {
    borderColor: "rgba(255,215,0,0.6)",
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  checkIcon: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
  },
  plusIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    paddingVertical: 8,
    letterSpacing: -0.5,
  },
  descriptionBox: {
    marginHorizontal: 0,
    marginBottom: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  descInput: {
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 20,
  },
  separator: {
    height: 2,
    marginVertical: 16,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 2,
    borderColor: "rgba(255,215,0,0.3)",
  },
  dateEmoji: { fontSize: 15 },
  dateText: { fontSize: 13, fontWeight: "700" },
  clearBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,82,82,0.15)",
  },
  clearX: { fontSize: 16, color: "#FF5252", fontWeight: "800" },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#FFD700",
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  addGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  addText: { color: "#FFF", fontSize: 24, fontWeight: "400" },
  pressed: { opacity: 0.7, transform: [{ scale: 0.94 }] },
});

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
    minHeight: 115,
    shadowColor: "#FFD700",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    borderWidth: 2,
    borderColor: "rgba(255,215,0,0.25)",
  },
  goldenBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#FFD700",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#FFD700",
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 1,
  },
  blur: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 10,
    gap: 6,
  },
  shimmerLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    zIndex: 1,
  },
  icon: { fontSize: 28, color: "white" },
  value: { fontSize: 26, fontWeight: "800", letterSpacing: -0.8 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  goldenBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255,215,0,0.3)",
  },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  meshBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 500,
    zIndex: 0,
  },
  glowElement: {
    position: "absolute",
    borderRadius: 9999,
    zIndex: 0,
  },
  glowTopRight: {
    width: 600,
    height: 600,
    top: -300,
    right: -200,
    backgroundColor: "#FFD700",
    opacity: 0.08,
  },
  glowBottomLeft: {
    width: 500,
    height: 500,
    bottom: -250,
    left: -150,
    backgroundColor: "#DAA520",
    opacity: 0.06,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 20, flexGrow: 1 },
  emptyList: { justifyContent: "center" },
  headerContainer: { zIndex: 1, paddingTop: 12, paddingBottom: 8 },
  headerBg: {
    position: "absolute",
    top: 0,
    left: -16,
    right: -16,
    height: 280,
    zIndex: -1,
  },
  headerShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,215,0,0.2)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    marginTop: 8,
  },
  greeting: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: { fontSize: 42, fontWeight: "900", letterSpacing: -1.8 },
  avatarBtn: {
    borderRadius: 30,
    shadowColor: "#FFD700",
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
  },
  avatarShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  avatarText: { fontSize: 22, fontWeight: "800", color: "#FFF", zIndex: 1 },
  statsContainer: { flexDirection: "row", gap: 12, marginBottom: 22 },
  progressContainer: {
    marginBottom: 22,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressLabel: { fontSize: 13, fontWeight: "700" },
  progressPercent: { fontSize: 18, fontWeight: "900" },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
    shadowColor: "#FFD700",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  progressFill: { height: "100%", borderRadius: 4 },
  progressText: { fontSize: 12, fontWeight: "600" },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 22,
  },
  divider: { flex: 1, height: 1.5 },
  dividerText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  emptyContainer: { alignItems: "center", gap: 16, paddingVertical: 50 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFD700",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.6 },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: "400",
    textAlign: "center",
    maxWidth: 280,
  },
  footer: {
    paddingVertical: 14,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,215,0,0.1)",
  },
  footerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: -1,
  },
  footerText: { fontSize: 11, fontWeight: "600", letterSpacing: 0.4 },
});
