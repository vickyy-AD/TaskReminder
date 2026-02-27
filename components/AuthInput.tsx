import { COLORS } from "@/constants/colors";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

type Props = TextInputProps & {
  error?: string;
};

export default function AuthInput({ error, style, ...rest }: Props) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        placeholderTextColor={COLORS.placeholder}
        {...rest}
        style={[styles.input, style]}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: COLORS.input,
    fontSize: 14,
    color: COLORS.text,
  },
  error: {
    marginTop: 4,
    color: COLORS.error,
    fontSize: 12,
    marginLeft: 10,
  },
});
