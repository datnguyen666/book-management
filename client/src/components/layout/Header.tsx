import { useEffect, useState } from "react";
import { BookOpen, Search, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useLocation, useNavigate } from "react-router-dom";
import { searchBooks } from "@/api/book.api";
import { getMediaUrl } from "@/lib/media";

interface SearchBook {
  id: number;
  title: string;
  author: string;
  isbn: string;
  coverImage?: string | null;
}

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();
  const location = useLocation();

  const HIDDEN_SEARCH_ROUTES = ["/staff", "/borrows"];

  const isSearchHidden = HIDDEN_SEARCH_ROUTES.some((path) =>
    location.pathname.startsWith(path),
  );

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
    <header
      className="flex h-16 items-center justify-between gap-3 bg-white px-4 sm:px-6"
      style={{ borderBottom: "1px solid #E6DFCE" }}
    >
      {/* Hamburger - mobile only */}
      <button
        type="button"
        onClick={onMenuClick}
        className="shrink-0 text-gray-600 hover:text-gray-900 lg:hidden"
      >
        <Menu size={22} />
      </button>

      {/* Page title + Date/Time */}
      <div className="min-w-0 flex-1 lg:flex-none">
        <h2
          className="truncate text-lg font-semibold sm:text-xl"
          style={{ fontFamily: "'Source Serif 4', serif", color: "#12192B" }}
        >
          {pageTitle}
        </h2>
        <p
          className="mt-0.5 hidden truncate text-xs sm:block"
          style={{
            color: "#8A93A6",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {formattedDateTime}
        </p>
      </div>

      {!isSearchHidden && (
        <div className="relative mx-8 hidden max-w-xl flex-1 md:block">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#9AA3B5" }}
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
              placeholder="Search books, authors ..."
              className="w-full rounded-md py-2.5 pl-10 pr-10 text-sm outline-none transition"
              style={{
                backgroundColor: "#F7F2E7",
                border: "1px solid #E6DFCE",
                color: "#12192B",
              }}
              onFocusCapture={(e) => {
                e.currentTarget.style.borderColor = "#B8863B";
                e.currentTarget.style.backgroundColor = "#FFFFFF";
              }}
              onBlurCapture={(e) => {
                e.currentTarget.style.borderColor = "#E6DFCE";
                e.currentTarget.style.backgroundColor = "#F7F2E7";
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
            <div
              className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-md bg-white shadow-lg"
              style={{ border: "1px solid #E6DFCE" }}
            >
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
                      className="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#F7F2E7]"
                      style={{ borderColor: "#EFE9DA" }}
                    >
                      <div className="h-14 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                        {book.coverImage ? (
                          <img
                            src={getMediaUrl(book.coverImage)}
                            alt={book.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <BookOpen size={16} className="text-gray-300" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {book.title}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {book.author}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          ISBN: {book.isbn}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* User area */}
      <div className="flex items-center gap-4">
        {/* User information */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
            style={{
              backgroundColor: "#12192B",
              color: "#C89B3C",
            }}
          >
            {avatarText}
          </div>

          {/* Username + Role */}
          <div className="hidden sm:block">
            <p className="text-xs font-semibold" style={{ color: "#12192B" }}>
              {user?.fullName || user?.username}
            </p>

            <p className="text-xs" style={{ color: "#8A93A6" }}>
              {displayRole}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="rounded-md px-4 py-2 text-xs font-semibold transition-all duration-150 hover:opacity-85 active:scale-95"
          style={{
            backgroundColor: "#12192B",
            color: "#C89B3C",
            border: "1px solid #B8863B",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.04em",
          }}
        >
          LOGOUT
        </button>
      </div>
    </header>
  );
}
