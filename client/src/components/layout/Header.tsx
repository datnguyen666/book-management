import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useNavigate } from "react-router-dom";
import { searchBooks } from "@/api/book.api";

interface SearchBook {
  id: number;
  title: string;
  author: string;
  isbn: string;
}

export function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Cập nhật thời gian mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        setShowSearchResults(true);

        const results = await searchBooks(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Failed to search books:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSelectBook = (book: SearchBook) => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);

    navigate(`/books/${book.id}`);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Avatar
  const avatarText = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  // Role hiển thị
  const displayRole = user?.role === "ADMIN" ? "Administrator" : "Staff";

  // Format ngày + giờ
  const formattedDate = currentTime.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDateTime = `${formattedDate} • ${formattedTime}`;

  const pageTitle = "Book Management";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      {/* Page title + Date/Time */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{pageTitle}</h2>

        <p className="mt-0.5 text-xs" style={{ color: "#94a8c2" }}>
          {formattedDateTime}
        </p>
      </div>

      <div className="relative mx-8 hidden max-w-xl flex-1 md:block">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => {
              if (searchQuery.trim()) {
                setShowSearchResults(true);
              }
            }}
            placeholder="Search books..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500"
            style={{
              backgroundColor: "#faf8f3",
              border: "1px solid #ede6d4",
              color: "#111827",
            }}
          />

          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search results */}
        {showSearchResults && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            {isSearching && (
              <div className="px-4 py-4 text-sm text-gray-500">
                Searching...
              </div>
            )}

            {!isSearching &&
              searchResults.length === 0 &&
              searchQuery.trim() && (
                <div className="px-4 py-4 text-sm text-gray-500">
                  No books found.
                </div>
              )}

            {!isSearching && searchResults.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((book) => (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => handleSelectBook(book)}
                    className="block w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50"
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      {book.title}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">{book.author}</p>

                    <p className="mt-1 text-xs text-gray-400">
                      ISBN: {book.isbn}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User area */}
      <div className="flex items-center gap-4">
        {/* User information */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
            style={{
              backgroundColor: "#111827",
              color: "#d4a853",
            }}
          >
            {avatarText}
          </div>

          {/* Username + Role */}
          <div className="hidden sm:block">
            <p className="text-xs font-semibold" style={{ color: "#111827" }}>
              {user?.fullName || user?.username}
            </p>

            <p className="text-xs" style={{ color: "#94a8c2" }}>
              {displayRole}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="rounded-md px-4 py-2 text-xs font-semibold transition-all duration-150 hover:opacity-90 active:scale-95"
          style={{
            backgroundColor: "#111827",
            color: "#d4a853",
            border: "1px solid #d4a853",
            fontFamily: "JetBrains Mono, monospace",
            letterSpacing: "0.04em",
          }}
        >
          LOGOUT
        </button>
      </div>
    </header>
  );
}
