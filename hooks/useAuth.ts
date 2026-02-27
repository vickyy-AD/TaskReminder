import { useState } from "react";
import Toast from "../components/Toast";
import { supabase } from "../lib/supabase";

const emailRegex = /^\S+@\S+\.\S+$/;

type AuthHookReturn = {
  email: string;
  password: string;
  emailError: string;
  passwordError: string;
  loading: boolean;
  onChangeEmail: (text: string) => void;
  onChangePassword: (text: string) => void;
  submit: () => Promise<boolean>;
};

export function useLoginForm(): AuthHookReturn {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validate = () => {
    let hasError = false;

    if (!email) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!emailRegex.test(email)) {
      setEmailError("Enter a valid email");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      hasError = true;
    }

    if (hasError) {
      Toast.show({ msg: "Enter a valid email and password", bgColor: "red" });
      return false;
    }

    return true;
  };

  const submit = async () => {
    if (!validate()) return false;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Toast.show({ msg: error.message || "Login failed", bgColor: "red" });
      return false;
    }

    Toast.show({ msg: "Login successful", bgColor: "green" });
    return true;
  };

  const onChangeEmail = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError("");
  };

  const onChangePassword = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError("");
  };

  return {
    email,
    password,
    emailError,
    passwordError,
    loading,
    onChangeEmail,
    onChangePassword,
    submit,
  };
}

export function useSignupForm(): AuthHookReturn {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validate = () => {
    let hasError = false;

    if (!email) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!emailRegex.test(email)) {
      setEmailError("Enter a valid email");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      hasError = true;
    }

    if (hasError) {
      Toast.show({ msg: " Enter a valid email and password", bgColor: "red" });
      return false;
    }

    return true;
  };

  const submit = async () => {
    if (!validate()) return false;

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Toast.show({ msg: error.message || "Signup failed", bgColor: "red" });
      return false;
    }

    Toast.show({
      msg: "Account created. Please login.",
      bgColor: "green",
    });

    return true;
  };

  const onChangeEmail = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError("");
  };

  const onChangePassword = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError("");
  };

  return {
    email,
    password,
    emailError,
    passwordError,
    loading,
    onChangeEmail,
    onChangePassword,
    submit,
  };
}

