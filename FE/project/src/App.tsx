import api from "./config/axiosConfig";  //import đúng tên export

function App() {
    api.get("/test")
        .then((res) => console.log("Backend connected:", res.data))
        .catch((err) => console.error("❌ Connection failed:", err));

    return <div>LinguaHub Connection Test</div>;
}

export default App;
