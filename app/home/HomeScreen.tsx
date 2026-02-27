import TaskInput from "@/components/TaskInput";
import TaskItem from "@/components/TaskItem";
import Toast from "@/components/Toast";
import { COLORS } from "@/constants/colors";
import { ROUTES } from "@/constants/routeConstants";
import { Task, useTasks } from "@/hooks/useTasks";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const router = useRouter();
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
        Toast.show({ msg: "Task added" });
      }
    },
    [addTask],
  );

  const handleLogout = useCallback(() => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
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

  const renderEmptyItem = useCallback(() => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No tasks yet.</Text>
        <Text style={styles.emptyText}>Add your first reminder.</Text>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.heyText}>Hey!</Text>
            <Text style={styles.titleText}>Here are your tasks</Text>
          </View>
          <TouchableOpacity style={styles.logoutChip} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <TaskInput onAdd={handleAddTask} />

        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={fetchTasks}
          contentContainerStyle={
            tasks.length === 0 ? styles.emptyListContainer : undefined
          }
          ListEmptyComponent={renderEmptyItem}
          renderItem={renderTaskItem}
          showsVerticalScrollIndicator={false}
        />

        <Text style={styles.footerText}>Task Reminder Lite</Text>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  heyText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    marginTop: 2,
  },
  subtitleText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  logoutChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  logoutText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    gap: 4,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  footerText: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
