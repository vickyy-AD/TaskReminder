import TaskInput from "@/components/TaskInput";
import TaskItem from "@/components/TaskItem";
import Toast from "@/components/Toast";
import { ROUTES } from "@/constants/routeConstants";
import { Task, useTasks } from "@/hooks/useTasks";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useRef } from "react";
import {
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Design tokens ─────────────────────────────────────────────────
const BLUE = "#0084FF";
const BLUE_SOFT = "rgba(0,132,255,0.12)";
const RED = "#FF3B30";
const GREEN = "#34C759";
const ORANGE = "#FF9500";
const SEPARATOR = "rgba(0,0,0,0.08)";
const GLASS_BG = "rgba(255,255,255,0.96)";
const GLASS_BORDER = "rgba(0,0,0,0.06)";

export default function Home() {
  const router = useRouter();
  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const {
    tasks,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    logout,
    fetchTasks,
  } = useTasks();

  const handleAddTask = useCallback(
    async (title: string, description?: string, dueDate?: Date | null) => {
      const ok = await addTask(title, description, dueDate);
      if (ok) {
        Toast.show({ msg: "Task added ✓", bgColor: GREEN });
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
      />
    ),
    [toggleTask, deleteTask],
  );

  const renderEmptyItem = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrap}>
          <Text style={styles.emptyIcon}>✓</Text>
        </View>
        <Text style={styles.emptyTitle}>All tasks completed!</Text>
        <Text style={styles.emptySubtitle}>
          Great work. Start fresh with a new task.
        </Text>
      </View>
    ),
    [],
  );

  // ─── Derived stats ───────────────────────────────────────────────
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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Premium animated gradient background */}
      <LinearGradient
        colors={[
          "rgba(0,132,255,0.08)",
          "rgba(175,82,222,0.04)",
          "rgba(255,255,255,0)",
        ]}
        locations={[0, 0.5, 1]}
        style={styles.meshGradient}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.2, y: 1 }}
        pointerEvents="none"
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
          <View style={styles.headerContainer}>
            {/* ─── Premium header ─── */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.greeting}>Today</Text>
                <Text style={styles.headerTitle}>My Tasks</Text>
              </View>

              <Pressable
                onPress={handleLogout}
                style={({ pressed }) => [
                  styles.avatarBtn,
                  pressed && styles.avatarBtnPressed,
                ]}
              >
                <LinearGradient
                  colors={[BLUE, "#5856D6"]}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarInitial}>A</Text>
                </LinearGradient>
              </Pressable>
            </View>

            {/* ─── Enhanced stats with icons ─── */}
            <View style={styles.statsRow}>
              <StatCard
                icon="📋"
                value={totalTasks}
                label="Total"
                color="#0D0D0D"
              />
              <StatCard icon="✓" value={doneTasks} label="Done" color={GREEN} />
              <StatCard
                icon="🔔"
                value={todayTasks}
                label="Today"
                color={ORANGE}
              />
              {overdueTasks > 0 && (
                <StatCard
                  icon="⚠️"
                  value={overdueTasks}
                  label="Overdue"
                  color={RED}
                />
              )}
            </View>

            {/* ─── Premium progress section ─── */}
            {totalTasks > 0 && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Progress</Text>
                  <Text style={styles.progressPercent}>
                    {Math.round(progress * 100)}%
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <LinearGradient
                    colors={[GREEN, "#32AE5F"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.progressFill,
                      { width: `${progress * 100}%` as any },
                    ]}
                  />
                </View>
                <Text style={styles.progressLabel}>
                  {doneTasks} of {totalTasks} completed
                </Text>
              </View>
            )}

            {/* ─── Task input ─── */}
            <TaskInput onAdd={handleAddTask} />

            {/* ─── Section divider ─── */}
            {tasks.length > 0 && (
              <View style={styles.sectionDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.sectionLabel}>Your Tasks</Text>
                <View style={styles.dividerLine} />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={renderEmptyItem}
        renderItem={renderTaskItem}
        showsVerticalScrollIndicator={false}
      />

      {/* ─── Footer ─── */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Task Reminder Lite</Text>
      </View>

      <Toast />
    </SafeAreaView>
  );
}

// ─── Stat card sub-component ──────────────────────────────────────
function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <BlurView intensity={60} tint="light" style={statStyles.card}>
      <Text style={statStyles.icon}>{icon}</Text>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </BlurView>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    minHeight: 100,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    gap: 4,
  },
  icon: {
    fontSize: 24,
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: "rgba(0,0,0,0.45)",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});

// ─── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7FB",
  },

  meshGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 340,
    zIndex: 0,
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
    paddingTop: 8,
    paddingBottom: 4,
  },

  // ─── Header ────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    marginTop: 6,
  },

  headerLeft: {
    gap: 4,
  },

  greeting: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(0,0,0,0.45)",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },

  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0D0D0D",
    letterSpacing: -1.2,
  },

  // Avatar button
  avatarBtn: {
    borderRadius: 24,
    shadowColor: BLUE,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  avatarBtnPressed: {
    transform: [{ scale: 0.92 }],
    shadowOpacity: 0.15,
  },

  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  // ─── Stats row ────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },

  // ─── Progress section ──────────────────────────────────
  progressSection: {
    marginBottom: 18,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  progressTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(0,0,0,0.65)",
  },

  progressPercent: {
    fontSize: 16,
    fontWeight: "700",
    color: GREEN,
  },

  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.08)",
    overflow: "hidden",
    marginBottom: 8,
    shadowColor: GREEN,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  progressFill: {
    height: "100%",
    borderRadius: 3,
  },

  progressLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(0,0,0,0.4)",
    letterSpacing: 0.2,
  },

  // ─── Section divider ───────────────────────────────────
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 16,
    marginHorizontal: -2,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: SEPARATOR,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(0,0,0,0.35)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  // ─── Empty state ───────────────────────────────────────
  emptyContainer: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 40,
  },

  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: BLUE_SOFT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  emptyIcon: {
    fontSize: 32,
    color: BLUE,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0D0D0D",
    letterSpacing: -0.5,
  },

  emptySubtitle: {
    fontSize: 14,
    color: "rgba(0,0,0,0.45)",
    fontWeight: "400",
    textAlign: "center",
    maxWidth: 260,
  },

  // ─── Footer ────────────────────────────────────────────
  footer: {
    paddingVertical: 12,
    alignItems: "center",
  },

  footerText: {
    fontSize: 10,
    fontWeight: "400",
    color: "rgba(0,0,0,0.2)",
    letterSpacing: 0.3,
  },
});
