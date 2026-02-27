import * as Battery from "expo-battery";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import Toast from "../components/Toast";
import { supabase } from "../lib/supabase";
import { sendTelegramMessage } from "../lib/telegram";
import { formatErrorMessage } from "@/utils/network";
 

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  due_date?: string | null;
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupNotifications = async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
        });
      }

      const { status } = await Notifications.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Enable notifications to get reminders",
        );
      }
    };

    setupNotifications();
  }, []);

  useEffect(() => {
    const checkBattery = async () => {
      const level = await Battery.getBatteryLevelAsync();
      const percent = Math.round(level * 100);

      if (percent <= 20) {
        await sendTelegramMessage(`⚠️ Battery low: ${percent}%`);
      }
    };

    checkBattery();
  }, []);

  const scheduleNotification = async (title: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Task Reminder",
        body: title,
      },
      trigger: {
        seconds: 60,
        repeats: false,
        channelId: "default",
      },
    });
  };

  const scheduleDueDateNotification = async (title: string, dueDate: Date) => {
    const now = new Date();
    if (dueDate <= now) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ Task Due",
        body: title,
      },
      trigger: { date: dueDate, channelId: "default" },
    });
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("id,title,description,completed,due_date")
      .order("created_at", { ascending: false });

    if (error) {
      const msg = formatErrorMessage(error.message, "Failed to load tasks");
      Toast.show({ msg, bgColor: "red" });
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (
    title: string,
    description?: string,
    dueDate?: Date | null,
  ): Promise<boolean> => {
    const payload: Record<string, unknown> = { title };
    if (description?.trim()) payload.description = description.trim();
    if (dueDate) payload.due_date = dueDate.toISOString();

    const { error } = await supabase.from("tasks").insert(payload);

    if (error) {
      const msg = formatNetworkAwareMessage(error.message, "Failed to add task");
      Toast.show({ msg, bgColor: "red" });
      return false;
    }

    await fetchTasks();
    if (dueDate) {
      await scheduleDueDateNotification(title, dueDate);
    } else {
      await scheduleNotification(title);
    }

    return true;
  };

  const toggleTask = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from("tasks")
      .update({ completed: !completed })
      .eq("id", id);

    if (error) {
      const msg = formatNetworkAwareMessage(error.message, "Failed to update task");
      Toast.show({ msg, bgColor: "red" });
      return;
    }

    fetchTasks();
    Toast.show({ msg: "Task updated successfully", bgColor: "green" });
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      const msg = formatNetworkAwareMessage(error.message, "Failed to delete task");
      Toast.show({ msg, bgColor: "red" });
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
    fetchTasks();
    Toast.show({ msg: "Task deleted successfully", bgColor: "red" });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return {
    tasks,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    logout,
    fetchTasks,
  };
}
