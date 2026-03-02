import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useRef } from "react";
import {
  Alert,
  Animated,
  ColorValue,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import TaskItem from "@/components/TaskItem";
import Toast from "@/components/Toast";
import { ROUTES } from "@/constants/routeConstants";
import { Task, useTasks } from "@/hooks/useTasks";

// ─── TYPE DEFINITIONS ─────────────────────────────────────────────────
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
  successGlow: string;
  warning: string;
  warningGlow: string;
  error: string;
  errorGlow: string;
  info: string;
  infoGlow: string;
};

// ─── THEME 1: MIDNIGHT AURORA (Professional) ──────────────────────────
const THEME_AURORA: ThemeType = {
  background: "#0A0E27",
  surface: "#1A1F3A",
  surfaceLight: "#242B4A",
  surfaceBright: "#2F3654",
  accentGradient: ["#00D4FF", "#0099FF"],
  accentGradient2: ["#7C3AED", "#5B21B6"],
  textPrimary: "#F0F4FF",
  textSecondary: "#A8B4D4",
  textTertiary: "#6B7491",
  success: "#10B981",
  successGlow: "rgba(16, 185, 129, 0.2)",
  warning: "#F59E0B",
  warningGlow: "rgba(245, 158, 11, 0.2)",
  error: "#EF4444",
  errorGlow: "rgba(239, 68, 68, 0.2)",
  info: "#3B82F6",
  infoGlow: "rgba(59, 130, 246, 0.2)",
};

// ─── THEME 2: MIDNIGHT OBSIDIAN (Luxury) ─────────────────────────────
const THEME_OBSIDIAN: ThemeType = {
  background: "#0F0F1A",
  surface: "#1A1A2E",
  surfaceLight: "#252B47",
  surfaceBright: "#313854",
  accentGradient: ["#FF6B9D", "#C944D2"],
  accentGradient2: ["#FFD26F", "#FF6B6B"],
  textPrimary: "#FFFFFF",
  textSecondary: "#B0B8C8",
  textTertiary: "#6B7280",
  success: "#34D399",
  successGlow: "rgba(52, 211, 153, 0.2)",
  warning: "#FBBF24",
  warningGlow: "rgba(251, 191, 36, 0.2)",
  error: "#F87171",
  errorGlow: "rgba(248, 113, 113, 0.2)",
  info: "#60A5FA",
  infoGlow: "rgba(96, 165, 250, 0.2)",
};

// ─── THEME 3: MIDNIGHT COSMIC (Modern) ───────────────────────────────
const THEME_COSMIC: ThemeType = {
  background: "#0C0015",
  surface: "#1A0A2E",
  surfaceLight: "#2A1F4E",
  surfaceBright: "#4A3F6F",
  accentGradient: ["#00F5FF", "#00A8E8"],
  accentGradient2: ["#FF006E", "#FB5607"],
  textPrimary: "#F5F5FF",
  textSecondary: "#C4B0FF",
  textTertiary: "#7B68B0",
  success: "#00FF88",
  successGlow: "rgba(0, 255, 136, 0.2)",
  warning: "#FFB500",
  warningGlow: "rgba(255, 181, 0, 0.2)",
  error: "#FF4757",
  errorGlow: "rgba(255, 71, 87, 0.2)",
  info: "#00D4FF",
  infoGlow: "rgba(0, 212, 255, 0.2)",
};

// ─── CHOOSE THEME HERE ────────────────────────────────────────────────
const THEME: ThemeType = THEME_AURORA;

// ─── STAT CARD COMPONENT ──────────────────────────────────────────────
interface StatCardProps {
  icon: string;
  value: number;
  label: string;
  gradientColors: [string, string] | [string, string, string];
  textColor: string;
  theme: ThemeType;
}

function StatCard({
  icon,
  value,
  label,
  gradientColors,
  textColor,
  theme,
}: StatCardProps) {
  const colors = Array.isArray(gradientColors)
    ? (gradientColors as ColorValue[])
    : (gradientColors as ColorValue[]);

  return (
    <LinearGradient colors={colors} style={statStyles.card}>
      <BlurView intensity={40} tint="dark" style={statStyles.blur}>
        <Text style={statStyles.icon}>{icon}</Text>
        <Text style={[statStyles.value, { color: textColor }]}>{value}</Text>
        <Text style={[statStyles.label, { color: theme.textTertiary }]}>
          {label}
        </Text>
      </BlurView>
    </LinearGradient>
  );
}

// ─── TASK INPUT DARK COMPONENT ────────────────────────────────────────
interface TaskInputDarkProps {
  onAdd: (
    title: string,
    description?: string,
    dueDate?: Date | null,
  ) => Promise<void>;
  theme: ThemeType;
}

function TaskInputDark({ onAdd, theme }: TaskInputDarkProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [dueDate, setDueDate] = React.useState<Date | null>(null);
  const [showPicker, setShowPicker] = React.useState(false);
  const [pickerMode, setPickerMode] = React.useState<"date" | "time">("date");
  const [isFocused, setIsFocused] = React.useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleAdd = () => {
    if (!title.trim()) {
      if (description.trim() || dueDate) {
        Toast.show({
          msg: "Add a title to create a task",
          bgColor: theme.error,
        });
      }
      return;
    }
    onAdd(title.trim(), description.trim() || undefined, dueDate);
    setTitle("");
    setDescription("");
    setDueDate(null);
    setIsFocused(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    if (!title.trim()) {
      setIsFocused(false);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === "dismissed") {
      setShowPicker(false);
      return;
    }

    if (pickerMode === "date" && date) {
      const merged = dueDate ? new Date(dueDate) : new Date(date);
      merged.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setDueDate(merged);

      if (Platform.OS === "android") {
        setShowPicker(false);
        setTimeout(() => {
          setPickerMode("time");
          setShowPicker(true);
        }, 300);
      } else {
        setPickerMode("time");
      }
    } else if (pickerMode === "time" && date) {
      const merged = dueDate ? new Date(dueDate) : new Date();
      merged.setHours(date.getHours(), date.getMinutes());
      setDueDate(merged);
      setShowPicker(false);
    }
  };

  const hasContent = title.trim().length > 0;

  const accentGradientColors: [ColorValue, ColorValue] = [
    theme.accentGradient[0] as ColorValue,
    theme.accentGradient[1] as ColorValue,
  ];

  const surfaceGradientColors: [ColorValue, ColorValue] = [
    theme.surfaceBright as ColorValue,
    theme.surface as ColorValue,
  ];

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={surfaceGradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={inputStyles.card}
      >
        <BlurView intensity={50} tint="dark" style={inputStyles.blur}>
          <LinearGradient
            colors={accentGradientColors}
            style={inputStyles.accentBar}
          />

          <View style={inputStyles.titleRow}>
            <View
              style={[
                inputStyles.leadIcon,
                hasContent && inputStyles.leadIconActive,
              ]}
            >
              {hasContent ? (
                <LinearGradient
                  colors={accentGradientColors}
                  style={inputStyles.iconGradient}
                >
                  <Text style={inputStyles.leadIconTextActive}>✓</Text>
                </LinearGradient>
              ) : (
                <Text style={inputStyles.leadIconText}>+</Text>
              )}
            </View>

            <TextInput
              placeholder="What needs to be done?"
              placeholderTextColor={theme.textTertiary}
              value={title}
              onChangeText={setTitle}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={[inputStyles.titleInput, { color: theme.textPrimary }]}
              returnKeyType="next"
            />
          </View>

          {(isFocused || description) && (
            <View
              style={[
                inputStyles.descriptionContainer,
                { backgroundColor: theme.surfaceBright + "40" },
              ]}
            >
              <TextInput
                placeholder="Add details or notes…"
                placeholderTextColor={theme.textTertiary}
                value={description}
                onChangeText={setDescription}
                style={[inputStyles.descInput, { color: theme.textSecondary }]}
                multiline
                numberOfLines={2}
                returnKeyType="done"
                onSubmitEditing={handleAdd}
              />
            </View>
          )}

          <View
            style={[
              inputStyles.separator,
              { backgroundColor: theme.surfaceBright },
            ]}
          />

          <View style={inputStyles.actionRow}>
            <Pressable
              onPress={() => setShowPicker(true)}
              style={({ pressed }) => [
                inputStyles.dateChip,
                { backgroundColor: theme.surfaceBright + "60" },
                dueDate && { backgroundColor: theme.infoGlow },
                pressed && inputStyles.chipPressed,
              ]}
            >
              <Text style={inputStyles.dateChipEmoji}>
                {dueDate ? "📅" : "🕐"}
              </Text>
              <Text
                style={[
                  inputStyles.dateChipText,
                  { color: theme.textSecondary },
                  dueDate && { color: theme.info },
                ]}
              >
                {dueDate
                  ? dueDate.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  : "Set due date"}
              </Text>
            </Pressable>

            <View style={{ flex: 1 }} />

            <Pressable
              onPress={handleAdd}
              style={({ pressed }) => [
                inputStyles.addFab,
                pressed && inputStyles.addFabPressed,
              ]}
            >
              <LinearGradient
                colors={
                  hasContent
                    ? (accentGradientColors as ColorValue[])
                    : (surfaceGradientColors as ColorValue[])
                }
                style={inputStyles.fabGradient}
              >
                <Text style={inputStyles.addFabText}>+</Text>
              </LinearGradient>
            </Pressable>
          </View>

          {showPicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode={pickerMode}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={new Date()}
              onChange={handlePickerChange}
            />
          )}
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── MAIN HOME COMPONENT ──────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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

  const meshGradientColors: [ColorValue, ColorValue, ColorValue] = [
    (THEME.accentGradient[0] + "15") as ColorValue,
    (THEME.accentGradient[1] + "08") as ColorValue,
    THEME.background as ColorValue,
  ];

  const avatarGradient: [ColorValue, ColorValue] = [
    THEME.accentGradient[0] as ColorValue,
    THEME.accentGradient[1] as ColorValue,
  ];

  const headerGradient: [ColorValue, ColorValue] = [
    (THEME.surfaceLight + "40") as ColorValue,
    (THEME.background + "20") as ColorValue,
  ];

  const footerGradient: [ColorValue, ColorValue] = [
    (THEME.surfaceLight + "20") as ColorValue,
    (THEME.background + "00") as ColorValue,
  ];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: THEME.background }]}
      edges={["top", "left", "right"]}
    >
      <LinearGradient
        colors={meshGradientColors}
        locations={[0, 0.4, 1]}
        style={styles.meshGradient}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.2, y: 1 }}
        pointerEvents="none"
      />

      <View style={[styles.glowElement, styles.glowTop]} />
      <View style={[styles.glowElement, styles.glowBottom]} />

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
            style={[styles.headerContainer, { opacity: fadeAnim }]}
          >
            <LinearGradient
              colors={headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradientBg}
            />

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
                  <Text style={styles.avatarInitial}>A</Text>
                </LinearGradient>
              </Pressable>
            </View>

            <View style={styles.statsRow}>
              <StatCard
                icon="📋"
                value={totalTasks}
                label="Total"
                gradientColors={[THEME.surfaceLight, THEME.surfaceBright]}
                textColor={THEME.textPrimary}
                theme={THEME}
              />
              <StatCard
                icon="✓"
                value={doneTasks}
                label="Done"
                gradientColors={[
                  (THEME.success + "20") as string,
                  (THEME.success + "05") as string,
                ]}
                textColor={THEME.success}
                theme={THEME}
              />
              <StatCard
                icon="🔔"
                value={todayTasks}
                label="Today"
                gradientColors={[
                  (THEME.warning + "20") as string,
                  (THEME.warning + "05") as string,
                ]}
                textColor={THEME.warning}
                theme={THEME}
              />
              {overdueTasks > 0 && (
                <StatCard
                  icon="⚠️"
                  value={overdueTasks}
                  label="Overdue"
                  gradientColors={[
                    (THEME.error + "20") as string,
                    (THEME.error + "05") as string,
                  ]}
                  textColor={THEME.error}
                  theme={THEME}
                />
              )}
            </View>

            {totalTasks > 0 && (
              <View
                style={[
                  styles.progressSection,
                  { backgroundColor: THEME.surfaceLight + "40" },
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
                <Text
                  style={[styles.progressLabel, { color: THEME.textTertiary }]}
                >
                  {doneTasks} of {totalTasks} completed
                </Text>
              </View>
            )}

            <TaskInputDark onAdd={handleAddTask} theme={THEME} />

            {tasks.length > 0 && (
              <View style={styles.sectionDivider}>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: THEME.surfaceBright },
                  ]}
                />
                <Text
                  style={[styles.sectionLabel, { color: THEME.textTertiary }]}
                >
                  Your Tasks
                </Text>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: THEME.surfaceBright },
                  ]}
                />
              </View>
            )}
          </Animated.View>
        }
        ListEmptyComponent={renderEmptyItem}
        renderItem={renderTaskItem}
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.footer, { backgroundColor: THEME.surface + "40" }]}>
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
  card: {
    marginBottom: 24,
    marginHorizontal: 2,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  blur: {
    borderRadius: 20,
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  leadIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  leadIconActive: {
    borderColor: "rgba(255,255,255,0.3)",
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  leadIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
  },
  leadIconTextActive: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  titleInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 4,
    letterSpacing: -0.3,
  },
  descriptionContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  descInput: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    paddingVertical: 0,
  },
  separator: {
    height: 1,
    marginVertical: 12,
    marginHorizontal: 16,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  dateChipEmoji: {
    fontSize: 14,
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  chipPressed: {
    opacity: 0.7,
  },
  addFab: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  addFabPressed: {
    opacity: 0.8,
  },
  addFabText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "400",
  },
});

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    minHeight: 100,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  blur: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
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
    textTransform: "uppercase",
    letterSpacing: 0.4,
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
    height: 400,
    zIndex: 0,
  },
  glowElement: {
    position: "absolute",
    borderRadius: 9999,
    opacity: 0.15,
    zIndex: 0,
  },
  glowTop: {
    width: 400,
    height: 400,
    top: -150,
    right: -100,
    backgroundColor: THEME.accentGradient[0],
  },
  glowBottom: {
    width: 300,
    height: 300,
    bottom: -100,
    left: -50,
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
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerGradientBg: {
    position: "absolute",
    top: 0,
    left: -16,
    right: -16,
    height: 200,
    zIndex: -1,
  },
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
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1.2,
  },
  avatarBtn: {
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  avatarBtnPressed: {
    transform: [{ scale: 0.92 }],
    shadowOpacity: 0.2,
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
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  progressSection: {
    marginBottom: 18,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
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
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: "700",
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
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
    letterSpacing: 0.2,
  },
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
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  emptyContainer: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 40,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    maxWidth: 260,
  },
  footer: {
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
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
    fontSize: 10,
    fontWeight: "400",
    letterSpacing: 0.3,
  },
});
