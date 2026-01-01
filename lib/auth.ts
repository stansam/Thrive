import axios from "axios";

export const logout = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
        console.warn("No access token found, forcing logout");
        localStorage.clear();
        window.location.href = "/";
        return;
    }

    await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    localStorage.clear();
    window.location.href = "/";
};
