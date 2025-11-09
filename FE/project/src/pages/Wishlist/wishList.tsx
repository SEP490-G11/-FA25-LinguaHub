import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/config/axiosConfig";
import HeroSection from "./components/sections/hero-section";
import WishlistContent from "./components/sections/wishlist-content";
import Pagination from "./components/sections/pagination"; // ✅ import pagination component

interface WishlistItem {
  id: number;
  title: string;
  description: string;
  duration: number;
  price: number;
  language: string;
  thumbnailURL: string;
  categoryName: string;
  tutorName: string;
  status: string;
  isWishListed: boolean;
  isPurchased: boolean;
  learnerCount: number;
  tutorAvatarURL: string;
  tutorAddress: string;
  avgRating: number | null;
  totalRatings: number | null;
  createdAt: string;
}

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // mỗi trang hiển thị 6 khóa học

  const navigate = useNavigate();

  // ✅ Fetch wishlist from backend
  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);

      const token =
          localStorage.getItem("access_token") ||
          sessionStorage.getItem("access_token");

      if (!token) {
        alert("Please log in to view your wishlist.");
        navigate("/sign-in");
        return;
      }

      try {
        const res = await api.get<{ code: number; result: WishlistItem[] }>("/wishlist");

        if (res.data?.result && Array.isArray(res.data.result)) {
          // ✅ Lọc bỏ khóa học đã mua
          const filtered = res.data.result.filter(
              (item) => item.isPurchased === false || item.isPurchased === null
          );

          setWishlistItems(filtered);
          setFilteredItems(filtered);
        } else {
          setWishlistItems([]);
          setFilteredItems([]);
        }
      } catch (err: unknown) {
        const error = err as { response?: { status?: number } };
        if (error?.response?.status === 401) {
          alert("Your session has expired. Please log in again.");
          navigate("/sign-in");
          return;
        }
        console.error("❌ Error loading wishlist:", err);
        alert("Failed to load your wishlist. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [navigate]);

  // ✅ Remove item from wishlist
  const removeFromWishlist = async (id: number) => {
    const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

    if (!token) {
      alert("Please log in to remove an item from your wishlist.");
      navigate("/sign-in");
      return;
    }

    try {
      await api.delete(`/wishlist/${id}`);
      setWishlistItems((prev) => prev.filter((item) => item.id !== id));
      setFilteredItems((prev) => prev.filter((item) => item.id !== id));
      alert("Removed from wishlist successfully.");
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error?.response?.status === 401) {
        alert("Please log in to remove from wishlist.");
        navigate("/sign-in");
        return;
      }
      console.error("❌ Error removing from wishlist:", err);
      alert("Failed to remove from wishlist. Please try again.");
    }
  };

  // ✅ Handle search từ HeroSection
  const handleSearch = (keyword: string) => {
    setCurrentPage(1); // reset về trang đầu
    if (!keyword) {
      setFilteredItems(wishlistItems);
      return;
    }
    const filtered = wishlistItems.filter((item) =>
        item.title.toLowerCase().includes(keyword.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
        <div className="min-h-screen flex justify-center items-center text-lg text-gray-500">
          Loading your wishlist...
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
        <HeroSection itemCount={wishlistItems.length} onSearch={handleSearch} />
        <WishlistContent wishlistItems={currentItems} onRemoveItem={removeFromWishlist} />
        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
        />
      </div>
  );
};

export default Wishlist;
