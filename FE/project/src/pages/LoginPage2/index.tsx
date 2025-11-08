import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useState} from "react";
import api from "@/config/axiosConfig.ts";

export default function LoginPage2() {
    const [username, setUserName] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleLogin = async () => {
        try {
            const payload = { username, password };

            const response = await api.post("/auth/token", payload);
            // ✅ không cần http://localhost:8080 nữa, vì baseURL đã có

            const token = response.data.result.accessToken;
            localStorage.setItem("access_token", token);

            console.log("Login success, token:", token);
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <>
            <p> Login </p>

            <Input
                value={username}
                placeholder="Nhập username"
                onChange={(e) => setUserName(e.target.value)}
            />

            <Input
                value={password}
                placeholder="Nhập mật khẩu"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
            />

            <Button onClick={handleLogin}>Đăng nhập</Button>
        </>
    );
}
