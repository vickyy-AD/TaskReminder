import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useRef } from "react";
import {
  Alert,
  Animated,
  ColorValue,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TaskInputUltimatePremium from "@/components/TaskInput";
import TaskItem from "@/components/TaskItem";
import Toast from "@/components/Toast";
import { ROUTES } from "@/constants/routeConstants";
import { Task, useTasks } from "@/hooks/useTasks";

const { width } = Dimensions.get("window");

// ─── ULTRA PREMIUM THEME ──────────────────────────────────────────────
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
};

// ─── PREMIUM AURORA ───────────────────────────────────────────────────
const THEME_AURORA: ThemeType = {
  background: "#050810",
  surface: "#0F1627",
  surfaceLight: "#1A2236",
  surfaceBright: "#253346",
  accentGradient: ["#00E5FF", "#0084FF"],
  accentGradient2: ["#7C3AED", "#5B21B6"],
  textPrimary: "#F8FBFF",
  textSecondary: "#B0C4DE",
  textTertiary: "#7B8FA3",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
  successGlow: "rgba(16, 185, 129, 0.25)",
  warningGlow: "rgba(245, 158, 11, 0.25)",
  errorGlow: "rgba(239, 68, 68, 0.25)",
  infoGlow: "rgba(59, 130, 246, 0.25)",
};

// ─── PREMIUM OBSIDIAN ─────────────────────────────────────────────────
const THEME_OBSIDIAN: ThemeType = {
  background: "#070709",
  surface: "#14141F",
  surfaceLight: "#201F35",
  surfaceBright: "#2F2B47",
  accentGradient: ["#FF6B9D", "#C939E0"],
  accentGradient2: ["#FFD26F", "#FF6B6B"],
  textPrimary: "#FFFFFF",
  textSecondary: "#C5B0E0",
  textTertiary: "#8B7BA8",
  success: "#34D399",
  warning: "#FBBF24",
  error: "#F87171",
  info: "#60A5FA",
  successGlow: "rgba(52, 211, 153, 0.25)",
  warningGlow: "rgba(251, 191, 36, 0.25)",
  errorGlow: "rgba(248, 113, 113, 0.25)",
  infoGlow: "rgba(96, 165, 250, 0.25)",
};

// ─── PREMIUM COSMIC ───────────────────────────────────────────────────
const THEME_COSMIC: ThemeType = {
  background: "#050515",
  surface: "#12061F",
  surfaceLight: "#1F1540",
  surfaceBright: "#3D2B5C",
  accentGradient: ["#00F5FF", "#0099FF"],
  accentGradient2: ["#FF006E", "#FB5607"],
  textPrimary: "#F5F7FF",
  textSecondary: "#D0B0FF",
  textTertiary: "#9B7BB5",
  success: "#00FF88",
  warning: "#FFB500",
  error: "#FF4757",
  info: "#00D4FF",
  successGlow: "rgba(0, 255, 136, 0.25)",
  warningGlow: "rgba(255, 181, 0, 0.25)",
  errorGlow: "rgba(255, 71, 87, 0.25)",
  infoGlow: "rgba(0, 212, 255, 0.25)",
};

const THEME = THEME_AURORA;

// ─── ANIMATED STAT CARD ───────────────────────────────────────────────
interface AnimatedStatCardProps {
  icon: string;
  value: number;
  label: string;
  gradientColors: [string, string] | [string, string, string];
  textColor: string;
  theme: ThemeType;
  delay: number;
}

function AnimatedStatCard({
  icon,
  value,
  label,
  gradientColors,
  textColor,
  theme,
  delay,
}: AnimatedStatCardProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [scaleAnim, opacityAnim, delay]);

  const colors = Array.isArray(gradientColors)
    ? (gradientColors as ColorValue[])
    : (gradientColors as ColorValue[]);

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
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={statStyles.card}
      >
        <BlurView intensity={50} tint="dark" style={statStyles.blur}>
          {/* Shimmer effect overlay */}
          <View
            style={[
              statStyles.shimmer,
              {
                backgroundColor: `${textColor}10`,
              },
            ]}
          />
          <Text style={statStyles.icon}>{icon}</Text>
          <Text style={[statStyles.value, { color: textColor }]}>{value}</Text>
          <Text style={[statStyles.label, { color: theme.textTertiary }]}>
            {label}
          </Text>
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── ENHANCED TASK INPUT ──────────────────────────────────────────────
interface TaskInputPremiumProps {
  onAdd: (
    title: string,
    description?: string,
    dueDate?: Date | null,
  ) => Promise<void>;
  theme: ThemeType;
}

// ─── MAIN HOME COMPONENT ──────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const scrollOffsetY = useRef(new Animated.Value(0)).current;
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
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
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
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
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

  const renderEmptyItem = useCallback(() => {
    const emptyGradient: [ColorValue, ColorValue] = [
      THEME.accentGradient[0] as ColorValue,
      THEME.accentGradient[1] as ColorValue,
    ];

    return (
      <View style={styles.emptyContainer}>
        <LinearGradient
          colors={emptyGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyIconWrap}
        >
          <Text style={styles.emptyIcon}>✨</Text>
        </LinearGradient>
        <Text style={[styles.emptyTitle, { color: THEME.textPrimary }]}>
          All tasks completed!
        </Text>
        <Text style={[styles.emptySubtitle, { color: THEME.textSecondary }]}>
          You're crushing it! 🚀
        </Text>
      </View>
    );
  }, []);

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
    (THEME.accentGradient[0] + "20") as ColorValue,
    (THEME.accentGradient[1] + "08") as ColorValue,
    THEME.background as ColorValue,
  ];

  const avatarGradient: [ColorValue, ColorValue] = [
    THEME.accentGradient[0] as ColorValue,
    THEME.accentGradient[1] as ColorValue,
  ];

  const headerGradient: [ColorValue, ColorValue] = [
    (THEME.surfaceLight + "50") as ColorValue,
    (THEME.background + "20") as ColorValue,
  ];

  const footerGradient: [ColorValue, ColorValue] = [
    (THEME.surfaceLight + "30") as ColorValue,
    (THEME.background + "00") as ColorValue,
  ];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: THEME.background }]}
      edges={["top", "left", "right"]}
    >
      {/* Animated mesh gradient */}
      <LinearGradient
        colors={meshGradient}
        locations={[0, 0.4, 1]}
        style={styles.meshGradient}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.2, y: 1 }}
        pointerEvents="none"
      />

      {/* Premium glow elements */}
      <Animated.View
        style={[
          styles.glowElement,
          styles.glowTop,
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.2],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.glowElement,
          styles.glowBottom,
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.15],
            }),
          },
        ]}
      />

      <Animated.FlatList
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }],
          { useNativeDriver: false },
        )}
        data={tasks}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchTasks}
        contentContainerStyle={[
          styles.listContent,
          tasks.length === 0 && styles.emptyListContainer,
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
            {/* Header gradient background */}
            <LinearGradient
              colors={headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradientBg}
            />

            {/* Header top shimmer */}
            <View style={styles.headerShimmer} />

            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={[styles.greeting, { color: THEME.textTertiary }]}>
                  ⏰ Today
                </Text>
                <Text
                  style={[styles.headerTitle, { color: THEME.textPrimary }]}
                >
                  My Tasks
                </Text>
              </View>

              <Pressable
                onPress={handleLogout}
                style={({ pressed }) => [
                  styles.avatarBtn,
                  pressed && styles.avatarBtnPressed,
                ]}
              >
                <LinearGradient
                  colors={avatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarGradient}
                >
                  <View style={styles.avatarShimmer} />
                  <Text style={styles.avatarInitial}>A</Text>
                </LinearGradient>
              </Pressable>
            </View>

            {/* Stats with staggered animations */}
            <View style={styles.statsRow}>
              <AnimatedStatCard
                icon="📋"
                value={totalTasks}
                label="Total"
                gradientColors={[THEME.surfaceLight, THEME.surfaceBright]}
                textColor={THEME.textPrimary}
                theme={THEME}
                delay={0}
              />
              <AnimatedStatCard
                icon="✓"
                value={doneTasks}
                label="Done"
                gradientColors={[
                  (THEME.success + "30") as string,
                  (THEME.success + "10") as string,
                ]}
                textColor={THEME.success}
                theme={THEME}
                delay={100}
              />
              <AnimatedStatCard
                icon="🔔"
                value={todayTasks}
                label="Today"
                gradientColors={[
                  (THEME.warning + "30") as string,
                  (THEME.warning + "10") as string,
                ]}
                textColor={THEME.warning}
                theme={THEME}
                delay={200}
              />
              {overdueTasks > 0 && (
                <AnimatedStatCard
                  icon="⚠️"
                  value={overdueTasks}
                  label="Overdue"
                  gradientColors={[
                    (THEME.error + "30") as string,
                    (THEME.error + "10") as string,
                  ]}
                  textColor={THEME.error}
                  theme={THEME}
                  delay={300}
                />
              )}
            </View>

            {/* Premium progress section */}
            {totalTasks > 0 && (
              <Animated.View
                style={[
                  styles.progressSection,
                  {
                    backgroundColor: THEME.surfaceLight + "40",
                    opacity: fadeAnim,
                  },
                ]}
              >
                <View style={styles.progressHeader}>
                  <Text
                    style={[
                      styles.progressTitle,
                      { color: THEME.textSecondary },
                    ]}
                  >
                    Progress
                  </Text>
                  <Text
                    style={[styles.progressPercent, { color: THEME.success }]}
                  >
                    {Math.round(progress * 100)}%
                  </Text>
                </View>

                {/* Enhanced progress bar with glow */}
                <View style={styles.progressTrackWrapper}>
                  <View
                    style={[
                      styles.progressTrack,
                      { backgroundColor: THEME.surfaceBright },
                    ]}
                  >
                    <LinearGradient
                      colors={avatarGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.progressFill,
                        { width: `${progress * 100}%` as any },
                      ]}
                    />
                  </View>
                  {/* Progress glow */}
                  <View
                    style={[
                      styles.progressGlow,
                      {
                        width: `${progress * 100}%` as any,
                        backgroundColor: THEME.success + "20",
                      },
                    ]}
                  />
                </View>

                <Text
                  style={[styles.progressLabel, { color: THEME.textTertiary }]}
                >
                  {doneTasks} of {totalTasks} completed
                </Text>
              </Animated.View>
            )}

            {/* Task input */}
            <TaskInputUltimatePremium onAdd={handleAddTask} theme={THEME} />

            {/* Section divider with premium styling */}
            {tasks.length > 0 && (
              <View style={styles.sectionDivider}>
                <LinearGradient
                  colors={[
                    (THEME.surfaceBright + "00") as ColorValue,
                    THEME.surfaceBright as ColorValue,
                    (THEME.surfaceBright + "00") as ColorValue,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.dividerLine}
                />
                <Text
                  style={[styles.sectionLabel, { color: THEME.textTertiary }]}
                >
                  Your Tasks
                </Text>
                <LinearGradient
                  colors={[
                    (THEME.surfaceBright + "00") as ColorValue,
                    THEME.surfaceBright as ColorValue,
                    (THEME.surfaceBright + "00") as ColorValue,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.dividerLine}
                />
              </View>
            )}
          </Animated.View>
        }
        ListEmptyComponent={renderEmptyItem}
        renderItem={renderTaskItem}
        showsVerticalScrollIndicator={false}
      />

      {/* Premium footer */}
      <View style={[styles.footer, { backgroundColor: THEME.surface + "50" }]}>
        <LinearGradient
          colors={footerGradient}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.footerGradient}
        />
        <Text style={[styles.footerText, { color: THEME.textTertiary }]}>
          Task Reminder Lite • Premium Edition
        </Text>
      </View>

      <Toast />
    </SafeAreaView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────
const inputStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 28,
    marginHorizontal: 2,
  },
  glowBackdrop: {
    position: "absolute",
    top: -40,
    left: -20,
    right: -20,
    height: 360,
    borderRadius: 20,
    backgroundColor: THEME.accentGradient[0],
    zIndex: -1,
  },
  card: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  blur: {
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  shimmerTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 10,
  },
  leadIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  leadIconActive: {
    borderColor: "rgba(255,255,255,0.4)",
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  leadIconText: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255,255,255,0.35)",
  },
  leadIconTextActive: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
  titleInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    paddingVertical: 6,
    letterSpacing: -0.4,
  },
  descriptionContainer: {
    marginHorizontal: 0,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  descInput: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    paddingVertical: 0,
  },
  separator: {
    height: 1,
    marginVertical: 14,
    marginHorizontal: 0,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    gap: 7,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
  },
  dateChipEmoji: {
    fontSize: 15,
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  clearBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239,68,68,0.1)",
  },
  clearBtnPressed: {
    backgroundColor: "rgba(239,68,68,0.2)",
    transform: [{ scale: 0.92 }],
  },
  clearBtnText: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "700",
  },
  chipPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  addFab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  fabGlow: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 20,
    zIndex: 0,
  },
  addFabPressed: {
    transform: [{ scale: 0.88 }],
  },
  addFabText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "400",
    zIndex: 1,
  },
});

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 110,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  blur: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 10,
    gap: 6,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 1,
  },
  icon: {
    fontSize: 28,
  },
  value: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  meshGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 450,
    zIndex: 0,
  },
  glowElement: {
    position: "absolute",
    borderRadius: 9999,
    zIndex: 0,
  },
  glowTop: {
    width: 500,
    height: 500,
    top: -200,
    right: -150,
    backgroundColor: THEME.accentGradient[0],
  },
  glowBottom: {
    width: 400,
    height: 400,
    bottom: -150,
    left: -100,
    backgroundColor: THEME.accentGradient[1],
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyListContainer: {
    justifyContent: "center",
  },
  headerContainer: {
    zIndex: 1,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerGradientBg: {
    position: "absolute",
    top: 0,
    left: -16,
    right: -16,
    height: 240,
    zIndex: -1,
  },
  headerShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    marginTop: 8,
  },
  headerLeft: {
    gap: 6,
  },
  greeting: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  avatarBtn: {
    borderRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  avatarBtnPressed: {
    transform: [{ scale: 0.88 }],
    shadowOpacity: 0.25,
  },
  avatarGradient: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    zIndex: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
  },
  progressSection: {
    marginBottom: 22,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: "800",
  },
  progressTrackWrapper: {
    position: "relative",
    marginBottom: 10,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressGlow: {
    position: "absolute",
    height: 8,
    borderRadius: 4,
    top: 0,
    left: 0,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  emptyContainer: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 50,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
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
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  footerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: -1,
  },
  footerText: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.4,
  },
});
